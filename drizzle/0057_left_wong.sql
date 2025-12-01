ALTER TABLE `campeonatos` MODIFY COLUMN `dataInicio` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `campeonatos` MODIFY COLUMN `dataFim` timestamp NOT NULL DEFAULT (now());