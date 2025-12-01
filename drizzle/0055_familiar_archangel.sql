CREATE TABLE IF NOT EXISTS `metas_prs` (
    `id` int AUTO_INCREMENT NOT NULL,
    `userId` int NOT NULL,
    `movimento` varchar(100) NOT NULL,
    `cargaAtual` int NOT NULL,
    `cargaMeta` int NOT NULL,
    `dataInicio` timestamp NOT NULL DEFAULT (now()),
    `dataPrazo` timestamp NULL DEFAULT NULL,
    `status` enum('ativa','concluida','cancelada') NOT NULL DEFAULT 'ativa',
    `dataConclusao` timestamp NULL DEFAULT NULL,
    `observacoes` text,
    `createdAt` timestamp NOT NULL DEFAULT (now()),
    `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `metas_prs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_metas_prs_userId` ON `metas_prs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_metas_prs_status` ON `metas_prs` (`status`);