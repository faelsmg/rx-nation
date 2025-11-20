-- Tabela de eventos do box
CREATE TABLE IF NOT EXISTS eventos_box (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  criador_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo ENUM('workshop', 'competicao', 'social', 'outro') NOT NULL,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  local VARCHAR(255),
  max_participantes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_box (box_id),
  INDEX idx_data_inicio (data_inicio)
);

-- Tabela de RSVPs (confirmações de presença)
CREATE TABLE IF NOT EXISTS evento_rsvps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('confirmado', 'cancelado') DEFAULT 'confirmado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_rsvp (evento_id, user_id),
  INDEX idx_evento (evento_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (evento_id) REFERENCES eventos_box(id) ON DELETE CASCADE
);
