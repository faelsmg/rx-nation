-- Migration segura para criar a tabela `desafios_semanais`
-- compatível com MySQL em modo strict

CREATE TABLE `desafios_semanais` (
    `id` int AUTO_INCREMENT NOT NULL,
    `boxId` int,
    `tipo` enum('checkins','wods','prs','streak','custom') NOT NULL,
    `titulo` varchar(255) NOT NULL,
    `descricao` text NOT NULL,
    `meta` int NOT NULL,
    `pontosRecompensa` int NOT NULL DEFAULT 50,
    `icone` varchar(10) NOT NULL DEFAULT '🎯',
    `semanaAno` varchar(10) NOT NULL,

    `dataInicio` timestamp NOT NULL DEFAULT (now()),
    `dataFim` timestamp NOT NULL DEFAULT (now()),

    `ativo` boolean NOT NULL DEFAULT true,
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT `desafios_semanais_id` PRIMARY KEY(`id`)
);
