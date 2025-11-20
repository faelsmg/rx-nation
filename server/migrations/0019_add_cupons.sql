-- Tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS cupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  tipo ENUM('percentual', 'valor_fixo') NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  descricao TEXT,
  limite_uso INT DEFAULT NULL,
  usos_atuais INT DEFAULT 0,
  data_validade DATETIME DEFAULT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_box_id (box_id),
  INDEX idx_codigo (codigo)
);

-- Tabela de uso de cupons
CREATE TABLE IF NOT EXISTS cupons_usados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cupom_id INT NOT NULL,
  user_id INT NOT NULL,
  assinatura_id INT NOT NULL,
  valor_desconto DECIMAL(10, 2) NOT NULL,
  data_uso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE,
  INDEX idx_cupom_id (cupom_id),
  INDEX idx_user_id (user_id)
);

-- Adicionar campo de código de indicação único para cada usuário
ALTER TABLE users ADD COLUMN codigo_indicacao VARCHAR(20) UNIQUE DEFAULT NULL;

-- Tabela de indicações
CREATE TABLE IF NOT EXISTS indicacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  indicador_id INT NOT NULL,
  indicado_id INT NOT NULL,
  data_indicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  desconto_aplicado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (indicado_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_indicador (indicador_id),
  INDEX idx_indicado (indicado_id)
);
