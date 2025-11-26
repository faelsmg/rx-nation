/**
 * Script para criar usuários de demonstração
 * Impacto Pro League v1.0
 * 
 * Execução: node seed-demo-users.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Importar schema
const users = {
  id: 'id',
  openId: 'openId',
  name: 'name',
  email: 'email',
  loginMethod: 'loginMethod',
  role: 'role',
  boxId: 'boxId',
  categoria: 'categoria',
  faixaEtaria: 'faixaEtaria',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastSignedIn: 'lastSignedIn',
};

async function seedDemoUsers() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not configured');
    process.exit(1);
  }

  console.log('🌱 Seeding demo users...');

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Verificar se já existem usuários demo
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE openId LIKE 'demo-%'"
    );

    if (existing[0].count > 0) {
      console.log('⚠️  Demo users already exist. Skipping...');
      await connection.end();
      return;
    }

    // Criar box de exemplo se não existir
    const [boxResult] = await connection.execute(
      "INSERT INTO boxes (nome, endereco, cidade, estado, tipo) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
      ['RX Nation Box', 'Rua Exemplo, 123', 'São Paulo', 'SP', 'proprio']
    );

    const boxId = boxResult.insertId || 1;

    // Usuários de demonstração
    const demoUsers = [
      {
        openId: 'demo-atleta',
        name: 'Rafael Souza',
        email: 'rafael.atleta@rxnation.com',
        loginMethod: 'demo',
        role: 'atleta',
        boxId: boxId,
        categoria: 'avancado',
        faixaEtaria: '25-29',
      },
      {
        openId: 'demo-box-master',
        name: 'Carlos Silva',
        email: 'carlos.coach@rxnation.com',
        loginMethod: 'demo',
        role: 'box_master',
        boxId: boxId,
        categoria: null,
        faixaEtaria: null,
      },
      {
        openId: 'demo-franqueado',
        name: 'Ana Paula Costa',
        email: 'ana.franqueada@rxnation.com',
        loginMethod: 'demo',
        role: 'franqueado',
        boxId: null,
        categoria: null,
        faixaEtaria: null,
      },
      {
        openId: 'demo-admin-liga',
        name: 'Pedro Henrique',
        email: 'pedro.admin@impactopro.com',
        loginMethod: 'demo',
        role: 'admin_liga',
        boxId: null,
        categoria: null,
        faixaEtaria: null,
      },
    ];

    // Inserir usuários
    for (const user of demoUsers) {
      await connection.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, boxId, categoria, faixaEtaria, lastSignedIn) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [user.openId, user.name, user.email, user.loginMethod, user.role, user.boxId, user.categoria, user.faixaEtaria]
      );
      console.log(`✅ Created: ${user.name} (${user.role})`);
    }

    // Criar alguns dados de exemplo para o atleta
    const [atletaResult] = await connection.execute(
      "SELECT id FROM users WHERE openId = 'demo-atleta'"
    );
    const atletaId = atletaResult[0]?.id;

    if (atletaId) {
      // Adicionar pontos
      await connection.execute(
        `INSERT INTO pontuacoes (userId, tipo, pontos, descricao, data) VALUES 
         (?, 'checkin', 10, 'Check-in na aula', DATE_SUB(NOW(), INTERVAL 1 DAY)),
         (?, 'wod_completo', 20, 'WOD completado', DATE_SUB(NOW(), INTERVAL 1 DAY)),
         (?, 'novo_pr', 30, 'Novo PR: Back Squat 100kg', DATE_SUB(NOW(), INTERVAL 2 DAY)),
         (?, 'checkin', 10, 'Check-in na aula', DATE_SUB(NOW(), INTERVAL 2 DAY)),
         (?, 'wod_completo', 20, 'WOD completado', DATE_SUB(NOW(), INTERVAL 2 DAY))`,
        [atletaId, atletaId, atletaId, atletaId, atletaId]
      );
      console.log(`✅ Added points for Rafael Souza`);

      // Adicionar PRs
      await connection.execute(
        `INSERT INTO prs (userId, movimento, carga, data) VALUES 
         (?, 'Back Squat', 100, DATE_SUB(NOW(), INTERVAL 2 DAY)),
         (?, 'Deadlift', 140, DATE_SUB(NOW(), INTERVAL 5 DAY)),
         (?, 'Snatch', 70, DATE_SUB(NOW(), INTERVAL 10 DAY))`,
        [atletaId, atletaId, atletaId]
      );
      console.log(`✅ Added PRs for Rafael Souza`);

      console.log(`✅ Demo data for Rafael Souza complete`);
    }

    console.log(`✅ Box and users created successfully`);

    console.log('\n✅ Demo users seeded successfully!');
    console.log('\n📝 Login URLs (development only):');
    console.log(`   Atleta:      http://localhost:3000/api/dev-login?openId=demo-atleta`);
    console.log(`   Box Master:  http://localhost:3000/api/dev-login?openId=demo-box-master`);
    console.log(`   Franqueado:  http://localhost:3000/api/dev-login?openId=demo-franqueado`);
    console.log(`   Admin Liga:  http://localhost:3000/api/dev-login?openId=demo-admin-liga`);

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDemoUsers().catch(console.error);
