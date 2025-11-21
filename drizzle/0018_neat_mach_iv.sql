ALTER TABLE `badges` ADD `nivel` enum('bronze','prata','ouro','platina') DEFAULT 'bronze' NOT NULL;--> statement-breakpoint
ALTER TABLE `badges` ADD `categoria` enum('wods','prs','frequencia','social','especial') DEFAULT 'especial' NOT NULL;--> statement-breakpoint
ALTER TABLE `badges` ADD `badgePrerequisito` int;--> statement-breakpoint
ALTER TABLE `badges` ADD `valorObjetivo` int;