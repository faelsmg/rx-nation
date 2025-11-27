CREATE INDEX `idx_checkins_userId_dataHora` ON `checkins` (`userId`,`dataHora`);--> statement-breakpoint
CREATE INDEX `idx_checkins_boxId_dataHora` ON `checkins` (`boxId`,`dataHora`);--> statement-breakpoint
CREATE INDEX `idx_feed_boxId_createdAt` ON `feed_atividades` (`boxId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_feed_userId_createdAt` ON `feed_atividades` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_resultados_userId_dataRegistro` ON `resultados_treinos` (`userId`,`dataRegistro`);--> statement-breakpoint
CREATE INDEX `idx_resultados_wodId` ON `resultados_treinos` (`wodId`);