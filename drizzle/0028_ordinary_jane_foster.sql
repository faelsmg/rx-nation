CREATE TABLE `agendamentos_mentoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentoriaId` int NOT NULL,
	`dataHora` timestamp NOT NULL,
	`local` varchar(255),
	`observacoes` text,
	`status` enum('agendado','realizado','cancelado') NOT NULL DEFAULT 'agendado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agendamentos_mentoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`mentoradoId` int NOT NULL,
	`boxId` int NOT NULL,
	`status` enum('pendente','ativa','concluida','cancelada') NOT NULL DEFAULT 'pendente',
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`avaliacaoMentor` int,
	`avaliacaoMentorado` int,
	`comentarioMentor` text,
	`comentarioMentorado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentorias_id` PRIMARY KEY(`id`)
);
