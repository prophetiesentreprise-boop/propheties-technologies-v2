ALTER TABLE `contactInquiries` ADD `status` enum('new','in_progress','responded','closed') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `contactInquiries` ADD `adminNote` text;--> statement-breakpoint
ALTER TABLE `contactInquiries` ADD `replyDraft` text;--> statement-breakpoint
ALTER TABLE `contactInquiries` ADD `respondedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contactInquiries` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;