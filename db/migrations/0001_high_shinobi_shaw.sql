CREATE TABLE `diary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`transcription` text NOT NULL,
	`sentiment` text NOT NULL,
	`reflection` text NOT NULL,
	`audio_url` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
