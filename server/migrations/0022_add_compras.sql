-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cnpj VARCHAR(18),
  email VARCHAR(320),
  telefone VARCHAR(20),
  endereco TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_box (box_id),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pedidos de compra
CREATE TABLE IF NOT EXISTS pedidos_compra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  fornecedor_id INT NOT NULL,
  numero_pedido VARCHAR(50) NOT NULL,
  data_pedido DATE NOT NULL,
  data_entrega_prevista DATE,
  data_entrega_real DATE,
  status ENUM('pendente', 'aprovado', 'em_transito', 'recebido', 'cancelado') DEFAULT 'pendente',
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  criado_por INT NOT NULL,
  aprovado_por INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  FOREIGN KEY (criado_por) REFERENCES users(id),
  FOREIGN KEY (aprovado_por) REFERENCES users(id),
  INDEX idx_box_status (box_id, status),
  INDEX idx_data_pedido (data_pedido),
  UNIQUE KEY uk_box_numero (box_id, numero_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de itens do pedido de compra
CREATE TABLE IF NOT EXISTS pedidos_compra_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(20),
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_total DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos_compra(id) ON DELETE CASCADE,
  INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
