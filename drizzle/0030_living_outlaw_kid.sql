CREATE TABLE `pedidos_marketplace` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`produtoId` int NOT NULL,
	`quantidade` int NOT NULL DEFAULT 1,
	`pontosUsados` int NOT NULL,
	`valorPago` int NOT NULL,
	`status` enum('pendente','processando','enviado','entregue','cancelado') NOT NULL DEFAULT 'pendente',
	`stripePaymentIntentId` varchar(255),
	`enderecoEntrega` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedidos_marketplace_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produtos_marketplace` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('vestuario','acessorios','suplementos','equipamentos') NOT NULL,
	`pontosNecessarios` int NOT NULL,
	`precoReal` int NOT NULL,
	`estoque` int NOT NULL DEFAULT 0,
	`imagemUrl` varchar(500),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produtos_marketplace_id` PRIMARY KEY(`id`)
);
