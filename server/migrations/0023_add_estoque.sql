-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  categoria_id INT,
  codigo_barras VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  unidade VARCHAR(20) NOT NULL DEFAULT 'un', -- un, kg, l, m, cx, etc
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  estoque_atual DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque_minimo DECIMAL(10,2) NOT NULL DEFAULT 0,
  estoque_maximo DECIMAL(10,2),
  localizacao VARCHAR(100), -- prateleira, armário, etc
  ativo BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias_produtos(id),
  INDEX idx_box (box_id),
  INDEX idx_categoria (categoria_id),
  INDEX idx_codigo_barras (codigo_barras),
  INDEX idx_estoque_minimo (estoque_minimo, estoque_atual),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  box_id INT NOT NULL,
  tipo ENUM('entrada', 'saida', 'ajuste', 'transferencia') NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  estoque_anterior DECIMAL(10,2) NOT NULL,
  estoque_novo DECIMAL(10,2) NOT NULL,
  motivo VARCHAR(255),
  documento VARCHAR(100), -- número do pedido, nota fiscal, etc
  pedido_compra_id INT, -- referência ao pedido de compra (se for entrada por compra)
  venda_id INT, -- referência à venda (se for saída por venda)
  usuario_id INT NOT NULL,
  data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (usuario_id) REFERENCES users(id),
  FOREIGN KEY (pedido_compra_id) REFERENCES pedidos_compra(id),
  INDEX idx_produto (produto_id),
  INDEX idx_box (box_id),
  INDEX idx_tipo (tipo),
  INDEX idx_data (data_movimentacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir categorias padrão para CrossFit
INSERT INTO categorias_produtos (nome, descricao) VALUES
('Suplementos', 'Whey protein, creatina, BCAA, etc'),
('Equipamentos', 'Kettlebells, halteres, barras, anilhas'),
('Acessórios', 'Munhequeiras, joelheiras, grips, cordas'),
('Vestuário', 'Camisetas, shorts, tops, calças'),
('Bebidas', 'Água, isotônicos, energéticos'),
('Limpeza', 'Produtos de limpeza e higienização'),
('Outros', 'Produtos diversos');
