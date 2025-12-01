ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `boxes` ADD `telefone` varchar(20);--> statement-breakpoint
ALTER TABLE `boxes` ADD `email` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `primeiroLogin` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;