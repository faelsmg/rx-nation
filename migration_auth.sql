-- Migração para remover OAuth e implementar autenticação com email/senha
-- Execute este SQL no seu banco de dados MySQL

-- 1. Adicionar novas colunas
ALTER TABLE `users` 
  ADD COLUMN `passwordHash` VARCHAR(255) AFTER `email`,
  ADD COLUMN `resetToken` VARCHAR(255) AFTER `passwordHash`,
  ADD COLUMN `resetTokenExpiry` TIMESTAMP NULL AFTER `resetToken`,
  ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE AFTER `role`;

-- 2. Modificar coluna email para ser NOT NULL e UNIQUE
ALTER TABLE `users` 
  MODIFY COLUMN `email` VARCHAR(320) NOT NULL UNIQUE;

-- 3. Remover colunas antigas do OAuth
ALTER TABLE `users` 
  DROP COLUMN `openId`,
  DROP COLUMN `loginMethod`;

-- 4. Adicionar índices para performance
CREATE INDEX `idx_users_email` ON `users`(`email`);
CREATE INDEX `idx_users_resetToken` ON `users`(`resetToken`);

-- Nota: Após executar esta migração, você precisará:
-- 1. Recriar os usuários com senhas
-- 2. Atualizar o código que usa getUserByOpenId() para getUserByEmail()
