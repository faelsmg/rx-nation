CREATE TABLE `agenda_aulas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boxId` int NOT NULL,
	`diaSemana` int NOT NULL,
	`horario` varchar(5) NOT NULL,
	`capacidade` int NOT NULL DEFAULT 20,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agenda_aulas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`icone` varchar(255),
	`criterio` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `baterias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campeonatoId` int NOT NULL,
	`wodId` int,
	`numero` int NOT NULL,
	`horario` timestamp NOT NULL,
	`capacidade` int NOT NULL DEFAULT 20,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `baterias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boxes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('proprio','parceiro') NOT NULL DEFAULT 'proprio',
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`ativo` boolean NOT NULL DEFAULT true,
	`dataAdesao` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boxes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campeonatos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('interno','cidade','regional','estadual','nacional') NOT NULL DEFAULT 'interno',
	`local` text,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp NOT NULL,
	`capacidade` int,
	`inscricoesAbertas` boolean NOT NULL DEFAULT true,
	`pesoRankingAnual` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campeonatos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wodId` int NOT NULL,
	`boxId` int NOT NULL,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comunicados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boxId` int,
	`autorId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`tipo` enum('geral','box','campeonato') NOT NULL DEFAULT 'geral',
	`dataPub` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comunicados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoes_campeonatos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campeonatoId` int NOT NULL,
	`userId` int NOT NULL,
	`categoria` enum('iniciante','intermediario','avancado','elite') NOT NULL,
	`faixaEtaria` varchar(20) NOT NULL,
	`statusPagamento` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`posicaoFinal` int,
	`pontos` int NOT NULL DEFAULT 0,
	`dataInscricao` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoes_campeonatos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planilhas_treino` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boxId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('hipertrofia','forca','endurance','misto') NOT NULL DEFAULT 'misto',
	`descricao` text,
	`duracao` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planilhas_treino_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pontuacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tipo` enum('checkin','wod_completo','novo_pr','participacao_campeonato','podio') NOT NULL,
	`pontos` int NOT NULL,
	`referencia` varchar(255),
	`data` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pontuacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movimento` varchar(100) NOT NULL,
	`carga` int NOT NULL,
	`data` timestamp NOT NULL,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rankings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('semanal','mensal','temporada','box','geral') NOT NULL,
	`userId` int NOT NULL,
	`boxId` int,
	`categoria` enum('iniciante','intermediario','avancado','elite'),
	`faixaEtaria` varchar(20),
	`posicao` int NOT NULL,
	`pontos` int NOT NULL,
	`periodo` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rankings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resultados_treinos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wodId` int NOT NULL,
	`tempo` int,
	`reps` int,
	`carga` int,
	`rxOuScale` enum('rx','scale') NOT NULL DEFAULT 'rx',
	`observacoes` text,
	`dataRegistro` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resultados_treinos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`dataConquista` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boxId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`tipo` enum('for_time','amrap','emom','tabata','strength','outro') NOT NULL DEFAULT 'for_time',
	`duracao` int,
	`timeCap` int,
	`data` timestamp NOT NULL,
	`oficial` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('atleta','box_master','franqueado','admin_liga') NOT NULL DEFAULT 'atleta';--> statement-breakpoint
ALTER TABLE `users` ADD `boxId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `categoria` enum('iniciante','intermediario','avancado','elite');--> statement-breakpoint
ALTER TABLE `users` ADD `faixaEtaria` varchar(20);