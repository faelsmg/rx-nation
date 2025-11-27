ALTER TABLE `configuracoes_liga` ADD `smtp_host` varchar(255);--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD `smtp_port` int DEFAULT 587;--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD `smtp_secure` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD `smtp_user` varchar(255);--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD `smtp_pass` text;--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD `smtp_from` varchar(320) DEFAULT '"RX Nation" <noreply@rxnation.com>';--> statement-breakpoint
ALTER TABLE `configuracoes_liga` ADD `smtp_provider` enum('gmail','sendgrid','aws_ses','custom') DEFAULT 'custom';