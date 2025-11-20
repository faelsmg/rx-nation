import { drizzle } from "drizzle-orm/mysql2";
import { boxes, badges } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar box principal (Impacto CrossFit)
  console.log("📦 Criando boxes...");
  await db.insert(boxes).values([
    {
      nome: "Impacto CrossFit",
      tipo: "proprio",
      endereco: "Rua Exemplo, 123",
      cidade: "São Paulo",
      estado: "SP",
      ativo: true,
    },
    {
      nome: "CrossFit Vale do Paraíba",
      tipo: "parceiro",
      endereco: "Av. Principal, 456",
      cidade: "São José dos Campos",
      estado: "SP",
      ativo: true,
    },
    {
      nome: "CrossFit Rio",
      tipo: "parceiro",
      endereco: "Rua Atlântica, 789",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      ativo: true,
    },
  ]);

  // Criar badges padrão
  console.log("🏅 Criando badges...");
  await db.insert(badges).values([
    {
      nome: "Primeiro PR",
      descricao: "Registrou seu primeiro Personal Record",
      criterio: "Registrar o primeiro PR em qualquer movimento",
      icone: "🎯",
    },
    {
      nome: "Sem Falhar",
      descricao: "Treinou 3x por semana durante 4 semanas seguidas",
      criterio: "4 semanas seguidas treinando 3x/semana",
      icone: "🔥",
    },
    {
      nome: "Competidor",
      descricao: "Participou de um campeonato oficial",
      criterio: "Participar de 1 campeonato oficial da liga",
      icone: "🏆",
    },
    {
      nome: "Veterano",
      descricao: "Mais de 1 ano ativo na plataforma",
      criterio: "Conta criada há mais de 1 ano",
      icone: "⭐",
    },
    {
      nome: "Podium",
      descricao: "Conquistou o pódio em um campeonato",
      criterio: "Ficar entre os 3 primeiros em qualquer campeonato",
      icone: "🥇",
    },
    {
      nome: "Força Bruta",
      descricao: "Atingiu PR de 100kg+ em algum lift",
      criterio: "Registrar PR de 100kg ou mais em qualquer movimento",
      icone: "💪",
    },
    {
      nome: "Maratonista",
      descricao: "Completou 100 WODs",
      criterio: "Registrar resultado em 100 WODs diferentes",
      icone: "🏃",
    },
    {
      nome: "RX Master",
      descricao: "Completou 50 WODs no padrão RX",
      criterio: "Registrar 50 resultados RX",
      icone: "💎",
    },
  ]);

  console.log("✅ Seed concluído com sucesso!");
}

seed()
  .catch((error) => {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
