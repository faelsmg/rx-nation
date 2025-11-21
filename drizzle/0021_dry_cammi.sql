CREATE TABLE `configuracao_pontuacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campeonatoId` int NOT NULL,
	`posicao` int NOT NULL,
	`pontos` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `configuracao_pontuacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resultados_atletas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inscricaoId` int NOT NULL,
	`bateriaId` int NOT NULL,
	`tempo` int,
	`reps` int,
	`posicao` int,
	`pontos` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`registradoPor` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resultados_atletas_id` PRIMARY KEY(`id`)
);
