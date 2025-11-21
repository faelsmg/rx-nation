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
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `desafios_semanais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progresso_desafios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`desafioId` int NOT NULL,
	`progressoAtual` int NOT NULL DEFAULT 0,
	`completado` boolean NOT NULL DEFAULT false,
	`dataCompletado` timestamp,
	`recompensaRecebida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `progresso_desafios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `feed_atividades` MODIFY COLUMN `tipo` enum('wod_completo','pr_quebrado','badge_desbloqueado','nivel_subiu','desafio_completo') NOT NULL;