CREATE TABLE `feed_atividades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`boxId` int NOT NULL,
	`tipo` enum('wod_completo','pr_quebrado','badge_desbloqueado') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`metadata` text,
	`curtidas` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feed_atividades_id` PRIMARY KEY(`id`)
);
