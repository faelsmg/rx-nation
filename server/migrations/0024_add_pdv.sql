-- Tabela de vendas (PDV)
CREATE TABLE IF NOT EXISTS vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  numero_venda VARCHAR(50) NOT NULL,
  data_venda DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cliente_id INT, -- referência ao usuário/atleta (opcional)
  cliente_nome VARCHAR(255), -- nome do cliente (se não for usuário cadastrado)
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento ENUM('dinheiro', 'debito', 'credito', 'pix', 'boleto', 'outro') NOT NULL,
  status ENUM('concluida', 'cancelada', 'pendente') DEFAULT 'concluida',
  observacoes TEXT,
  vendedor_id INT NOT NULL,
  cancelado_por INT,
  data_cancelamento DATETIME,
  motivo_cancelamento TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES users(id),
  FOREIGN KEY (vendedor_id) REFERENCES users(id),
  FOREIGN KEY (cancelado_por) REFERENCES users(id),
  INDEX idx_box_data (box_id, data_venda),
  INDEX idx_status (status),
  INDEX idx_vendedor (vendedor_id),
  UNIQUE KEY uk_box_numero (box_id, numero_venda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS vendas_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venda_id INT NOT NULL,
  produto_id INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto_item DECIMAL(10,2) DEFAULT 0,
  preco_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  INDEX idx_venda (venda_id),
  INDEX idx_produto (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de caixa (controle de abertura/fechamento)
CREATE TABLE IF NOT EXISTS caixa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  usuario_id INT NOT NULL,
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_fechamento DATETIME,
  valor_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_final DECIMAL(10,2),
  valor_vendas DECIMAL(10,2) DEFAULT 0,
  valor_retiradas DECIMAL(10,2) DEFAULT 0,
  valor_suprimentos DECIMAL(10,2) DEFAULT 0,
  status ENUM('aberto', 'fechado') DEFAULT 'aberto',
  observacoes TEXT,
  FOREIGN KEY (usuario_id) REFERENCES users(id),
  INDEX idx_box_status (box_id, status),
  INDEX idx_data_abertura (data_abertura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de movimentações de caixa
CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caixa_id INT NOT NULL,
  tipo ENUM('venda', 'retirada', 'suprimento') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao VARCHAR(255),
  venda_id INT, -- referência à venda (se for movimentação de venda)
  data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caixa_id) REFERENCES caixa(id) ON DELETE CASCADE,
  FOREIGN KEY (venda_id) REFERENCES vendas(id),
  INDEX idx_caixa (caixa_id),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
