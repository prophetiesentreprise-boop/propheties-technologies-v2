CREATE TABLE `siteVisuals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slot` varchar(80) NOT NULL,
	`imageUrl` varchar(1024) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteVisuals_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteVisuals_slot_unique` UNIQUE(`slot`)
);
