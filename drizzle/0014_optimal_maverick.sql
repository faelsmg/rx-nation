ALTER TABLE `playlists` ADD `tipo` enum('pessoal','box','premium') DEFAULT 'pessoal' NOT NULL;--> statement-breakpoint
ALTER TABLE `playlists` ADD `publica` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `playlists` ADD `preco` int;--> statement-breakpoint
ALTER TABLE `playlists` ADD `boxId` int;