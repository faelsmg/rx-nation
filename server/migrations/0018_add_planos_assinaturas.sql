-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS planos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  duracao_dias INT NOT NULL DEFAULT 30,
  limite_checkins INT DEFAULT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_box_id (box_id),
  INDEX idx_ativo (ativo)
);

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS assinaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plano_id INT NOT NULL,
  data_inicio DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status ENUM('ativa', 'vencida', 'cancelada') DEFAULT 'ativa',
  renovacao_automatica BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_plano_id (plano_id),
  INDEX idx_status (status),
  INDEX idx_data_vencimento (data_vencimento),
  FOREIGN KEY (plano_id) REFERENCES planos(id) ON DELETE RESTRICT
);

-- Criar tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS historico_pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assinatura_id INT NOT NULL,
  user_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_pagamento VARCHAR(50),
  status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assinatura_id (assinatura_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_data_pagamento (data_pagamento),
  FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE
);

-- Adicionar campos de assinatura na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plano_id INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_vencimento DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS status_assinatura ENUM('ativa', 'vencida', 'trial', 'cancelada') DEFAULT 'trial';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_plano_id ON users(plano_id);
CREATE INDEX IF NOT EXISTS idx_users_data_vencimento ON users(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_users_status_assinatura ON users(status_assinatura);
