import { drizzle } from "drizzle-orm/mysql2";
import { titulosEspeciais } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const titulos = [
  {
    nome: "Rei do WOD",
    descricao: "Complete 100 WODs e prove sua dedicação ao CrossFit",
    icone: "👑",
    criterio: "Completar 100 WODs",
    tipo: "wods",
    valorObjetivo: 100,
    ativo: true,
  },
  {
    nome: "Mestre dos PRs",
    descricao: "Quebre 50 recordes pessoais e mostre sua evolução",
    icone: "💪",
    criterio: "Quebrar 50 PRs",
    tipo: "prs",
    valorObjetivo: 50,
    ativo: true,
  },
  {
    nome: "Frequentador Assíduo",
    descricao: "Faça 90 check-ins e demonstre sua consistência",
    icone: "📅",
    criterio: "Realizar 90 check-ins",
    tipo: "frequencia",
    valorObjetivo: 90,
    ativo: true,
  },
  {
    nome: "Influenciador",
    descricao: "Tenha 100 seguidores e inspire outros atletas",
    icone: "⭐",
    criterio: "Ter 100 seguidores",
    tipo: "social",
    valorObjetivo: 100,
    ativo: true,
  },
  {
    nome: "Guerreiro Incansável",
    descricao: "Mantenha um streak de 30 dias consecutivos",
    icone: "🔥",
    criterio: "Manter streak de 30 dias",
    tipo: "streak",
    valorObjetivo: 30,
    ativo: true,
  },
  {
    nome: "Lenda do Box",
    descricao: "Complete 500 WODs e entre para a história",
    icone: "🏆",
    criterio: "Completar 500 WODs",
    tipo: "wods",
    valorObjetivo: 500,
    ativo: true,
  },
  {
    nome: "Quebrador de Recordes",
    descricao: "Quebre 100 PRs e seja uma máquina de evolução",
    icone: "⚡",
    criterio: "Quebrar 100 PRs",
    tipo: "prs",
    valorObjetivo: 100,
    ativo: true,
  },
  {
    nome: "Maratonista",
    descricao: "Faça 365 check-ins em um ano",
    icone: "🏃",
    criterio: "Realizar 365 check-ins",
    tipo: "frequencia",
    valorObjetivo: 365,
    ativo: true,
  },
  {
    nome: "Celebridade do Box",
    descricao: "Tenha 500 seguidores e seja uma referência",
    icone: "🌟",
    criterio: "Ter 500 seguidores",
    tipo: "social",
    valorObjetivo: 500,
    ativo: true,
  },
  {
    nome: "Imortal",
    descricao: "Mantenha um streak de 100 dias consecutivos",
    icone: "💎",
    criterio: "Manter streak de 100 dias",
    tipo: "streak",
    valorObjetivo: 100,
    ativo: true,
  },
];

async function seed() {
  console.log("🌱 Populando títulos especiais...");
  
  try {
    for (const titulo of titulos) {
      await db.insert(titulosEspeciais).values(titulo);
      console.log(`✅ Título criado: ${titulo.icone} ${titulo.nome}`);
    }
    
    console.log("\n🎉 Títulos especiais criados com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar títulos:", error);
    process.exit(1);
  }
}

seed();
