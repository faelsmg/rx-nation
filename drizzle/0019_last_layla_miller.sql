ALTER TABLE `campeonatos` ADD `descricao` text;--> statement-breakpoint
ALTER TABLE `campeonatos` ADD `boxId` int;--> statement-breakpoint
ALTER TABLE `campeonatos` ADD `dataAberturaInscricoes` timestamp;--> statement-breakpoint
ALTER TABLE `campeonatos` ADD `dataFechamentoInscricoes` timestamp;--> statement-breakpoint
ALTER TABLE `campeonatos` ADD `valorInscricao` int DEFAULT 0 NOT NULL;