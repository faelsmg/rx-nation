-- Migration: Adicionar tabela de notificações push
-- Data: 2025-01-20

CREATE TABLE IF NOT EXISTS notificacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  box_id INT,
  tipo ENUM('comunicado', 'wod', 'reserva', 'badge', 'campeonato', 'geral') NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  link VARCHAR(500),
  lida BOOLEAN DEFAULT FALSE,
  enviada_push BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_box_id (box_id),
  INDEX idx_lida (lida),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE
);

-- Adicionar coluna de subscription push nos users (para armazenar endpoint do Service Worker)
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscription JSON;


