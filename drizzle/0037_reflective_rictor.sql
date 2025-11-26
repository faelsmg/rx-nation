CREATE TABLE `comentarios_wod` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wod_id` int NOT NULL,
	`user_id` int NOT NULL,
	`comentario` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comentarios_wod_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comentarios_wod` ADD CONSTRAINT `comentarios_wod_wod_id_wods_id_fk` FOREIGN KEY (`wod_id`) REFERENCES `wods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_wod` ADD CONSTRAINT `comentarios_wod_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;