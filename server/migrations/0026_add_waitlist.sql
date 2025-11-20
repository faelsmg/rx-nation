-- Migration: Adicionar tabela de lista de espera para aulas
-- Data: 2025-01-20

CREATE TABLE IF NOT EXISTS aulas_waitlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aula_id INT NOT NULL,
  user_id INT NOT NULL,
  posicao INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notificado BOOLEAN DEFAULT FALSE,
  INDEX idx_aula_id (aula_id),
  INDEX idx_user_id (user_id),
  INDEX idx_posicao (aula_id, posicao),
  FOREIGN KEY (aula_id) REFERENCES agenda_aulas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_aula (aula_id, user_id)
);
