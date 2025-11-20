-- Tabela de conquistas semanais
CREATE TABLE IF NOT EXISTS conquistas_semanais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  icone VARCHAR(50) DEFAULT '🎯',
  tipo ENUM('treinos', 'prs', 'checkins', 'pontos', 'custom') NOT NULL,
  meta_valor INT NOT NULL,
  recompensa_pontos INT DEFAULT 50,
  badge_id INT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE SET NULL
);

-- Tabela de progresso de conquistas por usuário
CREATE TABLE IF NOT EXISTS user_conquistas_progresso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  conquista_id INT NOT NULL,
  semana_ano VARCHAR(10) NOT NULL, -- Formato: YYYY-WW
  progresso_atual INT DEFAULT 0,
  completada BOOLEAN DEFAULT FALSE,
  data_completada TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conquista_id) REFERENCES conquistas_semanais(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_conquista_semana (user_id, conquista_id, semana_ano)
);

-- Inserir conquistas semanais padrão
INSERT INTO conquistas_semanais (titulo, descricao, icone, tipo, meta_valor, recompensa_pontos) VALUES
('Guerreiro da Semana', 'Complete 5 WODs nesta semana', '💪', 'treinos', 5, 100),
('Caçador de PRs', 'Conquiste 3 PRs nesta semana', '🏆', 'prs', 3, 150),
('Consistência Total', 'Faça check-in 7 dias consecutivos', '🔥', 'checkins', 7, 200),
('Máquina de Pontos', 'Acumule 500 pontos nesta semana', '⚡', 'pontos', 500, 100),
('Dedicação Extrema', 'Complete 10 WODs nesta semana', '🚀', 'treinos', 10, 250);

-- Índices para otimizar queries
CREATE INDEX idx_user_conquistas_semana ON user_conquistas_progresso(user_id, semana_ano);
CREATE INDEX idx_conquistas_ativas ON conquistas_semanais(ativa);
