-- Tabela de desafios entre atletas
CREATE TABLE IF NOT EXISTS desafios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo ENUM('wod', 'pr', 'frequencia', 'custom') NOT NULL DEFAULT 'custom',
  movimento VARCHAR(100), -- Para desafios de PR
  wod_id INT, -- Para desafios de WOD específico
  meta_valor DECIMAL(10,2), -- Meta numérica (tempo, reps, peso, dias)
  meta_unidade VARCHAR(50), -- Unidade da meta (segundos, reps, kg, dias)
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  criador_id INT NOT NULL,
  box_id INT NOT NULL,
  status ENUM('ativo', 'concluido', 'cancelado') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criador_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE,
  FOREIGN KEY (wod_id) REFERENCES wods(id) ON DELETE SET NULL
);

-- Tabela de participantes dos desafios
CREATE TABLE IF NOT EXISTS desafio_participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  desafio_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pendente', 'aceito', 'recusado') NOT NULL DEFAULT 'pendente',
  resultado_valor DECIMAL(10,2), -- Resultado final do participante
  resultado_unidade VARCHAR(50),
  completado BOOLEAN DEFAULT FALSE,
  completado_em TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (desafio_id) REFERENCES desafios(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participante (desafio_id, user_id)
);

-- Tabela de atualizações do scoreboard (progresso em tempo real)
CREATE TABLE IF NOT EXISTS desafio_atualizacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  desafio_id INT NOT NULL,
  user_id INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(50),
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (desafio_id) REFERENCES desafios(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_desafios_box ON desafios(box_id, status);
CREATE INDEX idx_desafios_datas ON desafios(data_inicio, data_fim);
CREATE INDEX idx_participantes_desafio ON desafio_participantes(desafio_id);
CREATE INDEX idx_participantes_user ON desafio_participantes(user_id);
CREATE INDEX idx_atualizacoes_desafio ON desafio_atualizacoes(desafio_id, created_at);
