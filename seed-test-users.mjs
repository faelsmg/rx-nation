import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seedTestUsers() {
  console.log("🌱 Criando usuários de teste...");

  const testUsers = [
    {
      openId: "test-admin-liga-gabriel",
      name: "Gabriel (Messi)",
      email: "gabriel.messi@impactoproleague.com",
      loginMethod: "test",
      role: "admin_liga",
      boxId: null,
      categoria: null,
      faixaEtaria: null,
    },
    {
      openId: "test-box-master-carlos",
      name: "Carlos Silva",
      email: "carlos@impactobox.com",
      loginMethod: "test",
      role: "box_master",
      boxId: 1,
      categoria: null,
      faixaEtaria: null,
    },
    {
      openId: "test-atleta-joao",
      name: "João Santos",
      email: "joao@email.com",
      loginMethod: "test",
      role: "atleta",
      boxId: 1,
      categoria: "intermediario",
      faixaEtaria: "25-29",
    },
  ];

  for (const user of testUsers) {
    try {
      await db.insert(users).values(user).onDuplicateKeyUpdate({
        set: {
          name: user.name,
          email: user.email,
          role: user.role,
          boxId: user.boxId,
          categoria: user.categoria,
          faixaEtaria: user.faixaEtaria,
        },
      });
      console.log(`✅ Usuário criado/atualizado: ${user.name} (${user.role})`);
    } catch (error) {
      console.error(`❌ Erro ao criar usuário ${user.name}:`, error);
    }
  }

  console.log("✅ Usuários de teste criados com sucesso!");
  process.exit(0);
}

seedTestUsers().catch((error) => {
  console.error("❌ Erro ao criar usuários de teste:", error);
  process.exit(1);
});
