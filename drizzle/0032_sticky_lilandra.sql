CREATE TABLE `mensagens_chat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentoriaId` int NOT NULL,
	`remetenteId` int NOT NULL,
	`mensagem` text NOT NULL,
	`lida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mensagens_chat_id` PRIMARY KEY(`id`)
);
