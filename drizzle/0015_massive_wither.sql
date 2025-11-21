CREATE TABLE `playlist_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`playlistId` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlist_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `playlist_purchases_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
