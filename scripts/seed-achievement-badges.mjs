import { drizzle } from "drizzle-orm/mysql2";
import { badges } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const achievementBadges = [
  {
    nome: "Primeiro Passo",
    descricao: "Completou seu primeiro WOD",
    icone: "🎯",
    criterio: "Completar 1 WOD",
  },
  {
    nome: "Iniciante Dedicado",
    descricao: "Completou 10 WODs",
    icone: "💪",
    criterio: "Completar 10 WODs",
  },
  {
    nome: "Atleta Consistente",
    descricao: "Completou 50 WODs",
    icone: "🔥",
    criterio: "Completar 50 WODs",
  },
  {
    nome: "Centurião",
    descricao: "Completou 100 WODs",
    icone: "💯",
    criterio: "Completar 100 WODs",
  },
  {
    nome: "Lenda do Box",
    descricao: "Completou 500 WODs",
    icone: "👑",
    criterio: "Completar 500 WODs",
  },
  {
    nome: "Frequência Perfeita",
    descricao: "Compareceu em 7 aulas consecutivas",
    icone: "📅",
    criterio: "Comparecer em 7 aulas consecutivas",
  },
  {
    nome: "Mês Completo",
    descricao: "Compareceu em 30 aulas consecutivas",
    icone: "🗓️",
    criterio: "Comparecer em 30 aulas consecutivas",
  },
  {
    nome: "Maratonista",
    descricao: "Compareceu em 50 aulas consecutivas",
    icone: "🏃",
    criterio: "Comparecer em 50 aulas consecutivas",
  },
  {
    nome: "Primeiro PR",
    descricao: "Registrou seu primeiro Personal Record",
    icone: "🎖️",
    criterio: "Registrar 1 PR",
  },
  {
    nome: "Colecionador de PRs",
    descricao: "Registrou 10 Personal Records",
    icone: "🏆",
    criterio: "Registrar 10 PRs",
  },
  {
    nome: "Quebrador de Recordes",
    descricao: "Registrou 25 Personal Records",
    icone: "⭐",
    criterio: "Registrar 25 PRs",
  },
  {
    nome: "Madrugador",
    descricao: "Completou 20 WODs antes das 7h",
    icone: "🌅",
    criterio: "Completar 20 WODs antes das 7h",
  },
  {
    nome: "Guerreiro Noturno",
    descricao: "Completou 20 WODs após as 20h",
    icone: "🌙",
    criterio: "Completar 20 WODs após as 20h",
  },
];

async function seedAchievementBadges() {
  console.log("🏆 Populando badges de conquistas automáticas...");

  try {
    for (const badge of achievementBadges) {
      await db.insert(badges).values(badge);
      console.log(`✅ Badge criado: ${badge.nome} ${badge.icone}`);
    }

    console.log("\\n✨ Badges de conquistas criados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar badges:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedAchievementBadges();
