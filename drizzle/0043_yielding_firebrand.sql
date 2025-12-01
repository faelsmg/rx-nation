CREATE TABLE `seguidores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seguidor_id` int NOT NULL,
	`seguido_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seguidores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `seguidores` ADD CONSTRAINT `seguidores_seguidor_id_users_id_fk` FOREIGN KEY (`seguidor_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `seguidores` ADD CONSTRAINT `seguidores_seguido_id_users_id_fk` FOREIGN KEY (`seguido_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;