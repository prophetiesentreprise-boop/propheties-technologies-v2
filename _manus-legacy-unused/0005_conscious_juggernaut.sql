CREATE TABLE `siteVisits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`path` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `siteVisits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `siteVisits_createdAt_idx` ON `siteVisits` (`createdAt`);--> statement-breakpoint
CREATE INDEX `siteVisits_visitorId_idx` ON `siteVisits` (`visitorId`);