-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  cargo VARCHAR(100) NOT NULL,
  salario DECIMAL(10,2) NOT NULL,
  data_admissao DATE NOT NULL,
  data_demissao DATE,
  ativo BOOLEAN DEFAULT TRUE,
  email VARCHAR(320),
  telefone VARCHAR(20),
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_box (box_id),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de prestadores de serviços
CREATE TABLE IF NOT EXISTS prestadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18),
  tipo_servico VARCHAR(100) NOT NULL,
  valor_mensal DECIMAL(10,2),
  dia_pagamento INT,
  ativo BOOLEAN DEFAULT TRUE,
  email VARCHAR(320),
  telefone VARCHAR(20),
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_box (box_id),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de categorias de despesas
CREATE TABLE IF NOT EXISTS categorias_despesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_box (box_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir categorias padrão
INSERT INTO categorias_despesas (box_id, nome, descricao, cor) VALUES
(0, 'Folha de Pagamento', 'Salários de funcionários', '#ef4444'),
(0, 'Prestadores', 'Pagamento de prestadores de serviços', '#f97316'),
(0, 'Aluguel', 'Aluguel do espaço', '#eab308'),
(0, 'Equipamentos', 'Compra e manutenção de equipamentos', '#3b82f6'),
(0, 'Marketing', 'Despesas com marketing e publicidade', '#8b5cf6'),
(0, 'Utilidades', 'Água, luz, internet', '#10b981'),
(0, 'Outros', 'Outras despesas', '#6b7280');

-- Tabela de fluxo de caixa
CREATE TABLE IF NOT EXISTS fluxo_caixa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  tipo ENUM('entrada', 'saida') NOT NULL,
  categoria_id INT,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_transacao DATE NOT NULL,
  metodo_pagamento VARCHAR(50),
  funcionario_id INT,
  prestador_id INT,
  observacoes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias_despesas(id),
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
  FOREIGN KEY (prestador_id) REFERENCES prestadores(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_box_data (box_id, data_transacao),
  INDEX idx_tipo (tipo),
  INDEX idx_categoria (categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
