-- Tabela desafios_semanais já foi criada na migração 0019_medical_carnage
-- Esta migração adiciona apenas a tabela progresso_desafios e modifica feed_atividades

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
