CREATE TABLE `adminInvitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(160),
	`tokenHash` varchar(64) NOT NULL,
	`status` enum('pending','accepted','revoked','expired') NOT NULL DEFAULT 'pending',
	`invitedBy` int,
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminInvitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminInvitations_email_unique` UNIQUE(`email`),
	CONSTRAINT `adminInvitations_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `adminInvitations_status_idx` ON `adminInvitations` (`status`);--> statement-breakpoint
CREATE INDEX `adminInvitations_expiresAt_idx` ON `adminInvitations` (`expiresAt`);