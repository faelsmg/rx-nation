CREATE TABLE `estatisticas_engajamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_comentarios` int NOT NULL DEFAULT 0,
	`total_reacoes_recebidas` int NOT NULL DEFAULT 0,
	`total_reacoes_dadas` int NOT NULL DEFAULT 0,
	`total_mencoes_recebidas` int NOT NULL DEFAULT 0,
	`comentarios_mais_reagidos` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `estatisticas_engajamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `estatisticas_engajamento` ADD CONSTRAINT `estatisticas_engajamento_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;