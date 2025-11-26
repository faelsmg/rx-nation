CREATE TABLE `wod_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`tipo` enum('for_time','amrap','emom','tabata','strength','outro') NOT NULL DEFAULT 'for_time',
	`duracao` int,
	`timeCap` int,
	`videoYoutubeUrl` text,
	`categoria` enum('classico','personalizado') NOT NULL DEFAULT 'personalizado',
	`criadoPor` int,
	`boxId` int,
	`publico` boolean NOT NULL DEFAULT false,
	`vezesUsado` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wod_templates_id` PRIMARY KEY(`id`)
);
