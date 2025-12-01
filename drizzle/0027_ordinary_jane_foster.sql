CREATE TABLE IF NOT EXISTS `agendamentos_mentoria` (
    `id` int AUTO_INCREMENT NOT NULL,
    `mentoriaId` int NOT NULL,
    `dataHora` timestamp NOT NULL,
    `local` varchar(255),
    `observacoes` text,
    `status` enum('agendado','realizado','cancelado') NOT NULL DEFAULT 'agendado',

    `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT `agendamentos_mentoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentorias` (
  `id` int AUTO_INCREMENT NOT NULL,
  `mentorId` int NOT NULL,
  `mentoradoId` int NOT NULL,
  `boxId` int NOT NULL,
  `status` enum('pendente','ativa','concluida','cancelada') NOT NULL DEFAULT 'pendente',

  -- timestamps sem default implícito problemático
  `dataInicio` timestamp NULL DEFAULT NULL,
  `dataFim` timestamp NULL DEFAULT NULL,

  `avaliacaoMentor` int,
  `avaliacaoMentorado` int,
  `comentarioMentor` text,
  `comentarioMentorado` text,

  -- aqui usamos CURRENT_TIMESTAMP em vez de (now())
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT `mentorias_id` PRIMARY KEY(`id`)
);
