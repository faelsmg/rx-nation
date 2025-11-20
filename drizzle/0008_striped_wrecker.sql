CREATE TABLE `comentarios_feed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`atividade_id` int NOT NULL,
	`user_id` int NOT NULL,
	`comentario` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comentarios_feed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comentarios_feed` ADD CONSTRAINT `comentarios_feed_atividade_id_feed_atividades_id_fk` FOREIGN KEY (`atividade_id`) REFERENCES `feed_atividades`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_feed` ADD CONSTRAINT `comentarios_feed_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;