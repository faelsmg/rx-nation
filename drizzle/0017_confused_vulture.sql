ALTER TABLE `metas` MODIFY COLUMN `tipo` enum('wods','prs','frequencia','peso','pontos','badges','personalizada') NOT NULL;--> statement-breakpoint
ALTER TABLE `metas` ADD `unidade` varchar(50);--> statement-breakpoint
ALTER TABLE `metas` ADD `status` enum('ativa','completada','cancelada','expirada') DEFAULT 'ativa' NOT NULL;--> statement-breakpoint
ALTER TABLE `metas` ADD `completadaEm` timestamp;