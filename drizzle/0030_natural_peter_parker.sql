CREATE TABLE `wearable_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('apple_health','google_fit') NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiry` timestamp,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wearable_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('apple_health','google_fit') NOT NULL,
	`tipo` enum('frequencia_cardiaca','calorias','duracao_treino','passos','distancia') NOT NULL,
	`valor` int NOT NULL,
	`unidade` varchar(20) NOT NULL,
	`dataHora` timestamp NOT NULL,
	`sincronizado` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_data_id` PRIMARY KEY(`id`)
);
