import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada");
  process.exit(1);
}

async function cleanDatabase() {
  console.log("🧹 Iniciando limpeza do banco de dados...\n");
  
  const db = drizzle(DATABASE_URL);
  
  try {
    // Desabilitar foreign key checks temporariamente
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    
    console.log("📋 Buscando Box 'Impacto'...");
    const result: any = await db.execute(sql`SELECT id, nome FROM boxes WHERE nome LIKE '%Impacto%'`);
    const boxes = result[0];
    
    if (!boxes || boxes.length === 0) {
      console.error("❌ Box 'Impacto' não encontrado!");
      process.exit(1);
    }
    
    const impactoBoxId = boxes[0].id;
    const impactoBoxNome = boxes[0].nome;
    console.log(`✅ Box encontrado: ${impactoBoxNome} (ID: ${impactoBoxId})\n`);
    
    // Limpar tabelas mantendo apenas dados relacionados ao Box Impacto
    console.log("🗑️  Limpando tabelas...");
    
    // Deletar dados de outros boxes primeiro
    await db.execute(sql.raw(`DELETE FROM boxes WHERE id != ${impactoBoxId}`));
    console.log("   ✓ Boxes limpos (mantido apenas Impacto)");
    
    // Deletar usuários não relacionados ao Box Impacto (exceto admin_liga)
    await db.execute(sql.raw(`DELETE FROM users WHERE boxId IS NOT NULL AND boxId != ${impactoBoxId}`));
    console.log("   ✓ Usuários de outros boxes removidos");
    
    // Limpar tabelas de atividades (ordem importa por causa de foreign keys)
    await db.execute(sql`TRUNCATE TABLE resultados_treinos`);
    await db.execute(sql`TRUNCATE TABLE checkins`);
    await db.execute(sql`TRUNCATE TABLE prs`);
    await db.execute(sql.raw(`DELETE FROM wods WHERE boxId != ${impactoBoxId}`));
    await db.execute(sql`TRUNCATE TABLE reservas_aulas`);
    await db.execute(sql.raw(`DELETE FROM agenda_aulas WHERE boxId != ${impactoBoxId}`));
    await db.execute(sql.raw(`DELETE FROM comunicados WHERE boxId != ${impactoBoxId}`));
    console.log("   ✓ Atividades limpas");
    
    // Limpar notificações antigas
    await db.execute(sql`TRUNCATE TABLE notificacoes`);
    console.log("   ✓ Notificações limpas");
    
    // Limpar feed de atividades
    await db.execute(sql`TRUNCATE TABLE comentarios_feed`);
    await db.execute(sql`TRUNCATE TABLE curtidas_feed`);
    await db.execute(sql.raw(`DELETE FROM feed_atividades WHERE boxId != ${impactoBoxId}`));
    console.log("   ✓ Feed social limpo");
    
    // Limpar campeonatos
    await db.execute(sql`TRUNCATE TABLE inscricoes_campeonatos`);
    await db.execute(sql.raw(`DELETE FROM campeonatos WHERE boxId IS NOT NULL AND boxId != ${impactoBoxId}`));
    console.log("   ✓ Campeonatos limpos");
    
    // Limpar outras tabelas relacionadas
    await db.execute(sql`TRUNCATE TABLE pontuacoes`);
    await db.execute(sql`TRUNCATE TABLE user_badges`);
    console.log("   ✓ Gamificação e conquistas limpas");
    
    // Reabilitar foreign key checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
    
    console.log("\n✅ Limpeza concluída com sucesso!");
    console.log(`📦 Box mantido: ${impactoBoxNome} (ID: ${impactoBoxId})`);
    console.log("\n💡 Próximo passo: Execute 'npx tsx scripts/seed-test-users.ts' para criar usuários de teste\n");
    
  } catch (error) {
    console.error("\n❌ Erro durante limpeza:", error);
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
    process.exit(1);
  }
}

cleanDatabase();
