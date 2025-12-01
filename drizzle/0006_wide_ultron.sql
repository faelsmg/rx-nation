CREATE TABLE `metas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tipo` enum('wods','prs','frequencia','peso') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`valorAlvo` int NOT NULL,
	`valorAtual` int NOT NULL DEFAULT 0,
	`dataInicio` timestamp NOT NULL DEFAULT (now()),
	`dataFim` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`concluida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metas_id` PRIMARY KEY(`id`)
);
