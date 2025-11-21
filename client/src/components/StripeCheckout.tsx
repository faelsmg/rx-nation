import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  campeonatoNome: string;
  valor: number;
}

function CheckoutForm({ clientSecret, onSuccess, campeonatoNome, valor }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/campeonatos`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Erro ao processar pagamento");
      } else {
        toast.success("Pagamento confirmado! Inscrição realizada com sucesso.");
        onSuccess();
      }
    } catch (err) {
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pagamento da Inscrição</CardTitle>
          <CardDescription>
            {campeonatoNome} - R$ {valor.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement />
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              `Pagar R$ ${valor.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Pagamento seguro processado pelo Stripe
          </p>
        </CardContent>
      </Card>
    </form>
  );
}

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
  campeonatoNome: string;
  valor: number;
}

export default function StripeCheckout({
  clientSecret,
  onSuccess,
  campeonatoNome,
  valor,
}: StripeCheckoutProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        campeonatoNome={campeonatoNome}
        valor={valor}
      />
    </Elements>
  );
}
