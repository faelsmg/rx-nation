-- Tabela de conversas
CREATE TABLE IF NOT EXISTS conversas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  tipo ENUM('individual', 'grupo') NOT NULL DEFAULT 'individual',
  nome VARCHAR(255), -- Nome do grupo (se tipo = 'grupo')
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE,
  INDEX idx_box_id (box_id),
  INDEX idx_atualizado_em (atualizado_em)
);

-- Tabela de participantes das conversas
CREATE TABLE IF NOT EXISTS conversas_participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversa_id INT NOT NULL,
  user_id INT NOT NULL,
  ultima_leitura TIMESTAMP NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conversa_user (conversa_id, user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_conversa_id (conversa_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversa_id INT NOT NULL,
  remetente_id INT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo ENUM('texto', 'imagem', 'arquivo') NOT NULL DEFAULT 'texto',
  arquivo_url VARCHAR(500),
  lida BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
  FOREIGN KEY (remetente_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversa_id (conversa_id),
  INDEX idx_remetente_id (remetente_id),
  INDEX idx_criado_em (criado_em)
);

-- Tabela de indicador de "digitando"
CREATE TABLE IF NOT EXISTS chat_typing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversa_id INT NOT NULL,
  user_id INT NOT NULL,
  digitando BOOLEAN DEFAULT TRUE,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conversa_user_typing (conversa_id, user_id),
  INDEX idx_conversa_id (conversa_id)
);
