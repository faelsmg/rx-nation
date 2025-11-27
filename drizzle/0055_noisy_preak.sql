ALTER TABLE `users` ADD `whatsapp` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `whatsappOptIn` boolean DEFAULT false NOT NULL;