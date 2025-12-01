-- Adicionar badges de streak (7, 30, 60, 90 dias)
INSERT INTO badges (nome, descricao, icone, criterio, nivel, categoria, valorObjetivo) VALUES
('Streak de Fogo 🔥', 'Complete 7 dias consecutivos de treino', '🔥', 'Treinar por 7 dias seguidos sem falhar', 'bronze', 'frequencia', 7),
('Guerreiro Consistente 💪', 'Complete 30 dias consecutivos de treino', '💪', 'Treinar por 30 dias seguidos sem falhar', 'prata', 'frequencia', 30),
('Máquina Imparável ⚡', 'Complete 60 dias consecutivos de treino', '⚡', 'Treinar por 60 dias seguidos sem falhar', 'ouro', 'frequencia', 60),
('Lenda Viva 👑', 'Complete 90 dias consecutivos de treino', '👑', 'Treinar por 90 dias seguidos sem falhar', 'platina', 'frequencia', 90);
