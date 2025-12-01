CREATE TABLE `curtidas_feed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`atividade_id` int NOT NULL,
	`user_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curtidas_feed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `curtidas_feed` ADD CONSTRAINT `curtidas_feed_atividade_id_feed_atividades_id_fk` FOREIGN KEY (`atividade_id`) REFERENCES `feed_atividades`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `curtidas_feed` ADD CONSTRAINT `curtidas_feed_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;