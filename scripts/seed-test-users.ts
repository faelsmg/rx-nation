import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada");
  process.exit(1);
}

async function seedTestUsers() {
  console.log("🌱 Criando usuários de teste...\n");
  
  const db = drizzle(DATABASE_URL);
  
  try {
    // Buscar Box Impacto
    const result: any = await db.execute(sql`SELECT id, nome FROM boxes WHERE nome LIKE '%Impacto%'`);
    const boxes = result[0];
    
    if (!boxes || boxes.length === 0) {
      console.error("❌ Box 'Impacto' não encontrado!");
      process.exit(1);
    }
    
    const impactoBoxId = boxes[0].id;
    const impactoBoxNome = boxes[0].nome;
    console.log(`📦 Box: ${impactoBoxNome} (ID: ${impactoBoxId})\n`);
    
    // 1. Criar/Atualizar Dono do Box (Box Master)
    console.log("👤 Criando dono do box...");
    await db.execute(sql`
      INSERT INTO users (openId, name, email, loginMethod, role, boxId, categoria, faixaEtaria, createdAt, updatedAt, lastSignedIn)
      VALUES (
        'dono-impacto',
        'Rafael Souza',
        'rafael@impacto.com',
        'dev',
        'box_master',
        ${impactoBoxId},
        'avancado',
        '30-39',
        NOW(),
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        name = 'Rafael Souza',
        email = 'rafael@impacto.com',
        role = 'box_master',
        boxId = ${impactoBoxId},
        categoria = 'avancado',
        faixaEtaria = '30-39',
        updatedAt = NOW()
    `);
    console.log("   ✓ Rafael Souza (Box Master) - rafael@impacto.com\n");
    
    // 2. Criar 10 Alunos de Teste
    console.log("👥 Criando 10 alunos de teste...");
    
    const alunos = [
      { nome: "João Silva", email: "joao@teste.com", categoria: "iniciante", faixa: "18-29" },
      { nome: "Maria Santos", email: "maria@teste.com", categoria: "intermediario", faixa: "30-39" },
      { nome: "Pedro Costa", email: "pedro@teste.com", categoria: "avancado", faixa: "30-39" },
      { nome: "Ana Oliveira", email: "ana@teste.com", categoria: "elite", faixa: "25-34" },
      { nome: "Lucas Ferreira", email: "lucas@teste.com", categoria: "iniciante", faixa: "18-29" },
      { nome: "Juliana Lima", email: "juliana@teste.com", categoria: "intermediario", faixa: "30-39" },
      { nome: "Carlos Alves", email: "carlos@teste.com", categoria: "avancado", faixa: "40-49" },
      { nome: "Fernanda Rocha", email: "fernanda@teste.com", categoria: "intermediario", faixa: "25-34" },
      { nome: "Ricardo Mendes", email: "ricardo@teste.com", categoria: "elite", faixa: "30-39" },
      { nome: "Beatriz Cardoso", email: "beatriz@teste.com", categoria: "iniciante", faixa: "18-29" }
    ];
    
    for (const aluno of alunos) {
      const openId = `atleta-${aluno.email.split('@')[0]}`;
      await db.execute(sql`
        INSERT INTO users (openId, name, email, loginMethod, role, boxId, categoria, faixaEtaria, createdAt, updatedAt, lastSignedIn)
        VALUES (
          ${openId},
          ${aluno.nome},
          ${aluno.email},
          'dev',
          'atleta',
          ${impactoBoxId},
          ${aluno.categoria},
          ${aluno.faixa},
          NOW(),
          NOW(),
          NOW()
        )
        ON DUPLICATE KEY UPDATE
          name = ${aluno.nome},
          email = ${aluno.email},
          role = 'atleta',
          boxId = ${impactoBoxId},
          categoria = ${aluno.categoria},
          faixaEtaria = ${aluno.faixa},
          updatedAt = NOW()
      `);
      console.log(`   ✓ ${aluno.nome} (${aluno.categoria}) - ${aluno.email}`);
    }
    
    console.log("\n✅ Seed concluído com sucesso!");
    console.log("\n📋 CREDENCIAIS DE TESTE:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 DONO DO BOX:");
    console.log("   Email: rafael@impacto.com");
    console.log("   Role: box_master");
    console.log("\n👥 ALUNOS (10):");
    alunos.forEach(a => {
      console.log(`   • ${a.nome} - ${a.email} (${a.categoria})`);
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
  } catch (error) {
    console.error("\n❌ Erro durante seed:", error);
    process.exit(1);
  }
}

seedTestUsers();
