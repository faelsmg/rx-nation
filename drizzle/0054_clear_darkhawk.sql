CREATE TABLE `eventos_onboarding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`boxId` int,
	`tipo_evento` enum('cadastro_iniciado','cadastro_completo','email_boas_vindas_enviado','email_boas_vindas_aberto','clique_completar_perfil','clique_iniciar_tour','tour_iniciado','tour_completo','onboarding_completo','primeiro_wod_registrado','primeiro_checkin') NOT NULL,
	`metadata` text,
	`user_agent` text,
	`ip_address` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventos_onboarding_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `eventos_onboarding` ADD CONSTRAINT `eventos_onboarding_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventos_onboarding` ADD CONSTRAINT `eventos_onboarding_boxId_boxes_id_fk` FOREIGN KEY (`boxId`) REFERENCES `boxes`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_eventos_onboarding_userId` ON `eventos_onboarding` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_eventos_onboarding_tipoEvento` ON `eventos_onboarding` (`tipo_evento`);--> statement-breakpoint
CREATE INDEX `idx_eventos_onboarding_createdAt` ON `eventos_onboarding` (`createdAt`);