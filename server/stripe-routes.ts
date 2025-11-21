import express from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { playlistPurchases, playlists } from "../drizzle/schema";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

const router = express.Router();

/**
 * Webhook do Stripe - DEVE estar ANTES do express.json()
 * Processa eventos de pagamento
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      console.error("[Stripe Webhook] Missing signature");
      return res.status(400).send("Missing signature");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        ENV.stripeWebhookSecret
      );
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // CRITICAL: Detectar e responder a eventos de teste
    if (event.id.startsWith("evt_test_")) {
      console.log("[Stripe Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Stripe Webhook] Event received: ${event.type} (${event.id})`);

    try {
      // Processar evento de pagamento bem-sucedido
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const userId = paymentIntent.metadata.user_id;
        const playlistId = paymentIntent.metadata.playlist_id;

        if (!userId || !playlistId) {
          console.error("[Stripe Webhook] Missing metadata in payment_intent", paymentIntent.id);
          return res.status(400).send("Missing metadata");
        }

        // Registrar compra no banco
        const db = await getDb();
        if (!db) {
          console.error("[Stripe Webhook] Database not available");
          return res.status(500).send("Database error");
        }

        // Verificar se já foi registrado (idempotência)
        const existing = await db
          .select()
          .from(playlistPurchases)
          .where(eq(playlistPurchases.stripePaymentIntentId, paymentIntent.id))
          .limit(1);

        if (existing.length > 0) {
          console.log(`[Stripe Webhook] Purchase already recorded: ${paymentIntent.id}`);
          return res.json({ received: true });
        }

        // Inserir compra
        await db.insert(playlistPurchases).values({
          userId: parseInt(userId),
          playlistId: parseInt(playlistId),
          stripePaymentIntentId: paymentIntent.id,
        });

        console.log(`[Stripe Webhook] Purchase recorded: user=${userId}, playlist=${playlistId}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error(`[Stripe Webhook] Error processing event:`, error);
      res.status(500).send(`Webhook Error: ${error.message}`);
    }
  }
);

/**
 * Criar sessão de checkout para compra de playlist premium
 */
router.post("/create-checkout-session", express.json(), async (req, res) => {
  try {
    const { playlistId, userId, userEmail, userName } = req.body;

    if (!playlistId || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Buscar playlist no banco
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const playlistResult = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, playlistId))
      .limit(1);

    if (playlistResult.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const playlist = playlistResult[0];

    if (playlist.tipo !== "premium" || !playlist.preco) {
      return res.status(400).json({ error: "Playlist is not premium" });
    }

    // Criar sessão de checkout
    const origin = req.headers.origin || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: playlist.nome,
              description: playlist.descricao || "Playlist Premium",
            },
            unit_amount: playlist.preco, // já está em centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/descobrir-playlists?success=true`,
      cancel_url: `${origin}/descobrir-playlists?canceled=true`,
      customer_email: userEmail,
      client_reference_id: userId.toString(),
      metadata: {
        user_id: userId.toString(),
        playlist_id: playlistId.toString(),
        customer_email: userEmail,
        customer_name: userName || "",
      },
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe] Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
