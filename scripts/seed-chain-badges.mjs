import { drizzle } from "drizzle-orm/mysql2";
import { badges } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const chainBadges = [
  {
    nome: "Atleta Completo",
    descricao: "Complete 50 WODs, registre 10 PRs e mantenha 30 dias consecutivos de treino",
    icone: "🏆",
    criterio: JSON.stringify({
      wods: 50,
      prs: 10,
      diasConsecutivos: 30,
    }),
  },
  {
    nome: "Guerreiro Incansável",
    descricao: "Complete 100 WODs, registre 20 PRs e mantenha 50 dias consecutivos de treino",
    icone: "⚔️",
    criterio: JSON.stringify({
      wods: 100,
      prs: 20,
      diasConsecutivos: 50,
    }),
  },
  {
    nome: "Lenda Viva",
    descricao: "Complete 500 WODs, registre 50 PRs e mantenha 100 dias consecutivos de treino",
    icone: "👑",
    criterio: JSON.stringify({
      wods: 500,
      prs: 50,
      diasConsecutivos: 100,
    }),
  },
];

async function seed() {
  console.log("Populando badges de conquistas em cadeia...");

  for (const badge of chainBadges) {
    try {
      await db.insert(badges).values(badge);
      console.log(`✓ Badge criado: ${badge.nome}`);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(`⚠ Badge já existe: ${badge.nome}`);
      } else {
        console.error(`✗ Erro ao criar badge ${badge.nome}:`, error.message);
      }
    }
  }

  console.log("\n✅ Seed de badges de conquistas em cadeia concluído!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});
