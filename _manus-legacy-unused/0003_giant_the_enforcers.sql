CREATE TABLE `siteContentEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteContentEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteContentEntries_key_unique` UNIQUE(`key`)
);
