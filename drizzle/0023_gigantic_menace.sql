CREATE TABLE `premios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`tipo` enum('voucher','desconto','produto','outro') NOT NULL,
	`valor` int,
	`codigo` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`validoAte` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `premios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premios_usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`premioId` int NOT NULL,
	`rankingPosicao` int,
	`rankingAno` int,
	`resgatado` boolean NOT NULL DEFAULT false,
	`resgatadoEm` timestamp,
	`codigoResgate` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `premios_usuarios_id` PRIMARY KEY(`id`)
);
