-- Migração corrigida da tabela `convites`
-- Segura para MariaDB com STRICT / NO_ZERO_DATE

CREATE TABLE `convites` (
    `id` int AUTO_INCREMENT NOT NULL,
    `boxId` int NOT NULL,
    `email` varchar(320) NOT NULL,
    `token` varchar(64) NOT NULL,
    `status` enum('pendente','aceito','expirado','cancelado') NOT NULL DEFAULT 'pendente',
    `convidado_por` int NOT NULL,
    `aceito_por` int,
    `expires_at` timestamp NOT NULL,
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    `aceito_at` timestamp NULL DEFAULT NULL,
    CONSTRAINT `convites_id` PRIMARY KEY(`id`),
    CONSTRAINT `convites_token_unique` UNIQUE(`token`)
);

--> statement-breakpoint
ALTER TABLE `boxes` ADD `slug` varchar(100);--> statement-breakpoint
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `convites` ADD CONSTRAINT `convites_boxId_boxes_id_fk` FOREIGN KEY (`boxId`) REFERENCES `boxes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `convites` ADD CONSTRAINT `convites_convidado_por_users_id_fk` FOREIGN KEY (`convidado_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `convites` ADD CONSTRAINT `convites_aceito_por_users_id_fk` FOREIGN KEY (`aceito_por`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;