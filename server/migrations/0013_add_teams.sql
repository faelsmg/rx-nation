-- Tabela de equipes
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  box_id INT NOT NULL,
  capitao_id INT NOT NULL,
  cor VARCHAR(7) DEFAULT '#F2C200', -- Cor da equipe em hexadecimal
  logo_url VARCHAR(500),
  pontos_totais INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE,
  FOREIGN KEY (capitao_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de membros das equipes
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('capitao', 'membro') DEFAULT 'membro',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member (team_id, user_id)
);

-- Tabela de desafios entre equipes
CREATE TABLE IF NOT EXISTS team_desafios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo ENUM('wod', 'frequencia', 'pontos', 'custom') NOT NULL DEFAULT 'custom',
  meta_valor DECIMAL(10,2),
  meta_unidade VARCHAR(50),
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  criador_id INT NOT NULL,
  box_id INT NOT NULL,
  status ENUM('ativo', 'concluido', 'cancelado') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criador_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE
);

-- Tabela de participação de equipes em desafios
CREATE TABLE IF NOT EXISTS team_desafio_participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  desafio_id INT NOT NULL,
  team_id INT NOT NULL,
  pontos DECIMAL(10,2) DEFAULT 0,
  completado BOOLEAN DEFAULT FALSE,
  completado_em TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (desafio_id) REFERENCES team_desafios(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_desafio (desafio_id, team_id)
);

-- Índices para performance
CREATE INDEX idx_teams_box ON teams(box_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_desafios_box ON team_desafios(box_id, status);
CREATE INDEX idx_team_desafio_participantes_desafio ON team_desafio_participantes(desafio_id);
CREATE INDEX idx_team_desafio_participantes_team ON team_desafio_participantes(team_id);
