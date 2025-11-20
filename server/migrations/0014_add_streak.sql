-- Adicionar campos de streak na tabela users (se não existirem)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS streak_atual INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_recorde INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_atividade DATE NULL;

-- Criar badges de streak
INSERT INTO badges (nome, descricao, icone, criterio) VALUES
('Streak 7 Dias', 'Mantenha 7 dias consecutivos de check-ins', '🔥', 'streak_7_dias'),
('Streak 30 Dias', 'Mantenha 30 dias consecutivos de check-ins', '🔥🔥', 'streak_30_dias'),
('Streak 100 Dias', 'Mantenha 100 dias consecutivos de check-ins', '🔥🔥🔥', 'streak_100_dias'),
('Guerreiro Consistente', 'Alcance um streak recorde de 50 dias', '⚔️', 'streak_recorde_50');

-- Índice para otimizar queries de streak
CREATE INDEX idx_users_streak ON users(streak_atual, ultima_atividade);
