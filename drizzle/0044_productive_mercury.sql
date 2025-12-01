CREATE TABLE `historico_pontos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`tipo` enum('checkin','wod','pr','badge') NOT NULL,
	`pontos` int NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_pontos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pontuacao_usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`pontos_checkin` int NOT NULL DEFAULT 0,
	`pontos_wod` int NOT NULL DEFAULT 0,
	`pontos_pr` int NOT NULL DEFAULT 0,
	`pontos_badge` int NOT NULL DEFAULT 0,
	`pontos_total` int NOT NULL DEFAULT 0,
	`nivel` enum('bronze','prata','ouro','platina') NOT NULL DEFAULT 'bronze',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pontuacao_usuarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `pontuacao_usuarios_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `titulos_especiais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`icone` varchar(10),
	`criterio` text NOT NULL,
	`tipo` enum('wods','prs','frequencia','social','streak') NOT NULL,
	`valor_objetivo` int NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `titulos_especiais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_titulos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`titulo_id` int NOT NULL,
	`data_conquista` timestamp NOT NULL DEFAULT (now()),
	`principal` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_titulos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `historico_pontos` ADD CONSTRAINT `historico_pontos_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pontuacao_usuarios` ADD CONSTRAINT `pontuacao_usuarios_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_titulos` ADD CONSTRAINT `user_titulos_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_titulos` ADD CONSTRAINT `user_titulos_titulo_id_titulos_especiais_id_fk` FOREIGN KEY (`titulo_id`) REFERENCES `titulos_especiais`(`id`) ON DELETE cascade ON UPDATE no action;