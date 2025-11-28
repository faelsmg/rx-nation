// Novas funções de banco de dados para autenticação com email/senha
import { eq } from "drizzle-orm";
import { users, InsertUser } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Criar novo usuário com email/senha
 */
export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string | null;
  boxId?: number | null;
  role?: "atleta" | "box_master" | "franqueado" | "admin_liga";
  emailVerified?: boolean;
  primeiroLogin?: boolean;
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const insertData: InsertUser = {
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name || null,
    boxId: data.boxId || null,
    role: data.role || "atleta",
    emailVerified: data.emailVerified || false,
    primeiroLogin: data.primeiroLogin || false,
    lastSignedIn: new Date(),
  };

  const result = await db.insert(users).values(insertData);
  return Number(result[0].insertId);
}

/**
 * Buscar usuário por email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualizar último login do usuário
 */
export async function updateUserLastSignIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Definir token de recuperação de senha
 */
export async function setPasswordResetToken(
  userId: number, 
  resetToken: string, 
  resetTokenExpiry: Date
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ 
      resetToken, 
      resetTokenExpiry 
    })
    .where(eq(users.id, userId));
}

/**
 * Buscar usuário por token de recuperação
 */
export async function getUserByResetToken(resetToken: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select()
    .from(users)
    .where(eq(users.resetToken, resetToken))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualizar senha do usuário e limpar token de recuperação
 */
export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ 
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null
    })
    .where(eq(users.id, userId));
}

/**
 * Verificar email do usuário
 */
export async function verifyUserEmail(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, userId));
}

/**
 * Buscar usuário por ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualizar dados do usuário
 */
export async function updateUser(userId: number, data: Record<string, any>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set(data)
    .where(eq(users.id, userId));
}
