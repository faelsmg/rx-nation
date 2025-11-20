import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

const db = drizzle(process.env.DATABASE_URL);

// Criar tabela de notificações
const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tipo: mysqlEnum("tipo", ["wod", "comunicado", "aula", "badge", "geral"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

console.log("Schema de notificações criado com sucesso!");
