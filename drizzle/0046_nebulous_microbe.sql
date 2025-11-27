CREATE TABLE `configuracoes_liga` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_liga` varchar(100) NOT NULL DEFAULT 'RX Nation',
	`descricao` text,
	`email_contato` varchar(320),
	`modo_manutencao` boolean NOT NULL DEFAULT false,
	`notificacoes_email` boolean NOT NULL DEFAULT true,
	`notificacoes_push` boolean NOT NULL DEFAULT true,
	`tempo_sessao_minutos` int NOT NULL DEFAULT 60,
	`require_2fa` boolean NOT NULL DEFAULT false,
	`api_key_webhooks` varchar(255),
	`webhook_url` varchar(500),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` int,
	CONSTRAINT `configuracoes_liga_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD CONSTRAINT `configuracoes_liga_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;