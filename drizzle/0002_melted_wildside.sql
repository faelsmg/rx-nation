CREATE TABLE `reservas_aulas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agendaAulaId` int NOT NULL,
	`userId` int NOT NULL,
	`data` timestamp NOT NULL,
	`status` enum('confirmada','cancelada','presente','ausente') NOT NULL DEFAULT 'confirmada',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservas_aulas_id` PRIMARY KEY(`id`)
);
