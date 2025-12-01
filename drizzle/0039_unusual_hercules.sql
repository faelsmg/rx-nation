CREATE TABLE `streaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`streak_atual` int NOT NULL DEFAULT 0,
	`melhor_streak` int NOT NULL DEFAULT 0,
	`ultimo_checkin` timestamp,
	`data_inicio` timestamp NOT NULL DEFAULT (now()),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streaks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `streaks` ADD CONSTRAINT `streaks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;