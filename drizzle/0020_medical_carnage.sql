CREATE TABLE `atletas_baterias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bateriaId` int NOT NULL,
	`userId` int NOT NULL,
	`inscricaoId` int,
	`posicao` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `atletas_baterias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `baterias` ADD `nome` varchar(255);