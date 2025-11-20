import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users, boxes } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seedFranqueado() {
  console.log("🌱 Criando usuário Franqueado e boxes...");

  // Criar usuário Franqueado
  const franqueado = {
    openId: "test-franqueado-ricardo",
    name: "Ricardo Oliveira",
    email: "ricardo@franquiaimpacto.com",
    loginMethod: "test",
    role: "franqueado",
    boxId: null,
    categoria: null,
    faixaEtaria: null,
  };

  try {
    const [result] = await db.insert(users).values(franqueado).onDuplicateKeyUpdate({
      set: {
        name: franqueado.name,
        email: franqueado.email,
        role: franqueado.role,
      },
    });
    console.log(`✅ Franqueado criado: ${franqueado.name}`);

    // Pegar o ID do franqueado
    const [franqueadoUser] = await db.select().from(users).where(eq(users.openId, franqueado.openId)).limit(1);
    
    if (franqueadoUser) {
      // Criar 2 boxes parceiros vinculados ao franqueado
      const boxesParceiros = [
        {
          nome: "CrossFit Zona Sul",
          tipo: "parceiro",
          franqueadoId: franqueadoUser.id,
          endereco: "Rua das Palmeiras, 456",
          cidade: "São Paulo",
          estado: "SP",
          ativo: true,
        },
        {
          nome: "CrossFit Vila Mariana",
          tipo: "parceiro",
          franqueadoId: franqueadoUser.id,
          endereco: "Av. Domingos de Morais, 789",
          cidade: "São Paulo",
          estado: "SP",
          ativo: true,
        },
      ];

      for (const box of boxesParceiros) {
        await db.insert(boxes).values(box);
        console.log(`✅ Box parceiro criado: ${box.nome}`);
      }

      // Atualizar box Impacto Box para ter franqueadoId
      await db.update(boxes)
        .set({ franqueadoId: franqueadoUser.id })
        .where(eq(boxes.id, 1));
      console.log(`✅ Box Impacto Box vinculado ao franqueado`);
    }

    console.log("✅ Franqueado e boxes criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error);
  }

  process.exit(0);
}

seedFranqueado().catch((error) => {
  console.error("❌ Erro ao criar franqueado:", error);
  process.exit(1);
});
