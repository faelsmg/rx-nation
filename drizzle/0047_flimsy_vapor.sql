CREATE TABLE `denuncias_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentario_id` int NOT NULL,
	`denunciante_id` int NOT NULL,
	`motivo` enum('spam','ofensivo','assedio','conteudo_inadequado','outro') NOT NULL,
	`descricao` text,
	`status` enum('pendente','analisada','rejeitada') NOT NULL DEFAULT 'pendente',
	`analisada_por` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `denuncias_comentarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `denuncias_comentarios` ADD CONSTRAINT `denuncias_comentarios_comentario_id_comentarios_feed_id_fk` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios_feed`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `denuncias_comentarios` ADD CONSTRAINT `denuncias_comentarios_denunciante_id_users_id_fk` FOREIGN KEY (`denunciante_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;