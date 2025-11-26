CREATE TABLE `mencoes_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentario_id` int NOT NULL,
	`usuario_mencionado_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mencoes_comentarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reacoes_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentario_id` int NOT NULL,
	`user_id` int NOT NULL,
	`tipo` enum('like','strong','fire','heart') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reacoes_comentarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mencoes_comentarios` ADD CONSTRAINT `mencoes_comentarios_comentario_id_comentarios_wod_id_fk` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios_wod`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mencoes_comentarios` ADD CONSTRAINT `mencoes_comentarios_usuario_mencionado_id_users_id_fk` FOREIGN KEY (`usuario_mencionado_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reacoes_comentarios` ADD CONSTRAINT `reacoes_comentarios_comentario_id_comentarios_wod_id_fk` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios_wod`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reacoes_comentarios` ADD CONSTRAINT `reacoes_comentarios_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;