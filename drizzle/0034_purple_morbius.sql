CREATE TABLE `wod_favoritos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`wodId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wod_favoritos_id` PRIMARY KEY(`id`)
);
