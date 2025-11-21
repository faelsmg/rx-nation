import { drizzle } from "drizzle-orm/mysql2";
import { badges } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const conquistasProgressivas = [
  // Categoria: WODs
  {
    nome: "Iniciante nos WODs",
    descricao: "Complete 10 WODs",
    icone: "🏃",
    criterio: "Completar 10 WODs",
    nivel: "bronze",
    categoria: "wods",
    badgePrerequisito: null,
    valorObjetivo: 10,
  },
  {
    nome: "Guerreiro dos WODs",
    descricao: "Complete 50 WODs",
    icone: "⚔️",
    criterio: "Completar 50 WODs",
    nivel: "prata",
    categoria: "wods",
    badgePrerequisito: 1, // Iniciante nos WODs
    valorObjetivo: 50,
  },
  {
    nome: "Mestre dos WODs",
    descricao: "Complete 100 WODs",
    icone: "👑",
    criterio: "Completar 100 WODs",
    nivel: "ouro",
    categoria: "wods",
    badgePrerequisito: 2, // Guerreiro dos WODs
    valorObjetivo: 100,
  },
  {
    nome: "Lenda dos WODs",
    descricao: "Complete 250 WODs",
    icone: "🏆",
    criterio: "Completar 250 WODs",
    nivel: "platina",
    categoria: "wods",
    badgePrerequisito: 3, // Mestre dos WODs
    valorObjetivo: 250,
  },

  // Categoria: PRs
  {
    nome: "Primeiro PR",
    descricao: "Registre seu primeiro Personal Record",
    icone: "💪",
    criterio: "Registrar 1 PR",
    nivel: "bronze",
    categoria: "prs",
    badgePrerequisito: null,
    valorObjetivo: 1,
  },
  {
    nome: "Colecionador de PRs",
    descricao: "Registre 10 Personal Records",
    icone: "🎯",
    criterio: "Registrar 10 PRs",
    nivel: "prata",
    categoria: "prs",
    badgePrerequisito: 5, // Primeiro PR
    valorObjetivo: 10,
  },
  {
    nome: "Quebrador de Recordes",
    descricao: "Registre 25 Personal Records",
    icone: "⚡",
    criterio: "Registrar 25 PRs",
    nivel: "ouro",
    categoria: "prs",
    badgePrerequisito: 6, // Colecionador de PRs
    valorObjetivo: 25,
  },
  {
    nome: "Titã dos PRs",
    descricao: "Registre 50 Personal Records",
    icone: "🔥",
    criterio: "Registrar 50 PRs",
    nivel: "platina",
    categoria: "prs",
    badgePrerequisito: 7, // Quebrador de Recordes
    valorObjetivo: 50,
  },

  // Categoria: Frequência
  {
    nome: "Comprometido",
    descricao: "Faça check-in em 10 aulas",
    icone: "✅",
    criterio: "10 check-ins",
    nivel: "bronze",
    categoria: "frequencia",
    badgePrerequisito: null,
    valorObjetivo: 10,
  },
  {
    nome: "Dedicado",
    descricao: "Faça check-in em 50 aulas",
    icone: "📅",
    criterio: "50 check-ins",
    nivel: "prata",
    categoria: "frequencia",
    badgePrerequisito: 9, // Comprometido
    valorObjetivo: 50,
  },
  {
    nome: "Incansável",
    descricao: "Faça check-in em 100 aulas",
    icone: "🔥",
    criterio: "100 check-ins",
    nivel: "ouro",
    categoria: "frequencia",
    badgePrerequisito: 10, // Dedicado
    valorObjetivo: 100,
  },
  {
    nome: "Lendário",
    descricao: "Faça check-in em 250 aulas",
    icone: "💎",
    criterio: "250 check-ins",
    nivel: "platina",
    categoria: "frequencia",
    badgePrerequisito: 11, // Incansável
    valorObjetivo: 250,
  },

  // Categoria: Social
  {
    nome: "Sociável",
    descricao: "Curta 10 posts no feed",
    icone: "👍",
    criterio: "10 curtidas no feed",
    nivel: "bronze",
    categoria: "social",
    badgePrerequisito: null,
    valorObjetivo: 10,
  },
  {
    nome: "Engajado",
    descricao: "Curta 50 posts no feed",
    icone: "❤️",
    criterio: "50 curtidas no feed",
    nivel: "prata",
    categoria: "social",
    badgePrerequisito: 13, // Sociável
    valorObjetivo: 50,
  },
  {
    nome: "Influenciador",
    descricao: "Curta 100 posts no feed",
    icone: "⭐",
    criterio: "100 curtidas no feed",
    nivel: "ouro",
    categoria: "social",
    badgePrerequisito: 14, // Engajado
    valorObjetivo: 100,
  },
  {
    nome: "Celebridade do Box",
    descricao: "Curta 250 posts no feed",
    icone: "🌟",
    criterio: "250 curtidas no feed",
    nivel: "platina",
    categoria: "social",
    badgePrerequisito: 15, // Influenciador
    valorObjetivo: 250,
  },
];

async function seedConquistas() {
  console.log("🌱 Seeding conquistas progressivas...");
  
  try {
    for (const conquista of conquistasProgressivas) {
      await db.insert(badges).values(conquista);
      console.log(`✅ ${conquista.nome} (${conquista.nivel})`);
    }
    
    console.log("🎉 Seed de conquistas concluído!");
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
  }
}

seedConquistas();
