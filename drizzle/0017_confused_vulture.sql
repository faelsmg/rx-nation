-- Ajuste da tabela metas
ALTER TABLE `metas`
    MODIFY COLUMN `tipo` enum('wods','prs','frequencia','peso','pontos','badges','personalizada') NOT NULL,
    ADD COLUMN `completadaEm` timestamp NULL;
