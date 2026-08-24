CREATE TABLE `activists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`applied_at` text,
	`stage` text,
	`mentor` text,
	`status` text NOT NULL,
	`remark` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_activists_student` ON `activists` (`student_id`);--> statement-breakpoint
CREATE TABLE `assessment_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activist_id` integer NOT NULL,
	`assessed_at` text NOT NULL,
	`item` text,
	`result` text,
	`passed` integer DEFAULT 0 NOT NULL,
	`opinion` text,
	`recorder` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_assessment_activist` ON `assessment_records` (`activist_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`semester` text NOT NULL,
	`class_name` text NOT NULL,
	`total_hours` integer NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leave_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`start_at` text NOT NULL,
	`expected_return_at` text,
	`actual_return_at` text,
	`reason` text,
	`status` text NOT NULL,
	`remark` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_leave_records_student_status` ON `leave_records` (`student_id`,`status`);--> statement-breakpoint
CREATE TABLE `lesson_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`class_name` text NOT NULL,
	`topic` text NOT NULL,
	`hours` integer NOT NULL,
	`objectives` text,
	`key_points` text,
	`process` text,
	`activities` text,
	`homework` text,
	`reflection` text,
	`status` text DEFAULT '草稿' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_plans_course` ON `lesson_plans` (`course_id`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`student_no` text,
	`class_name` text NOT NULL,
	`phone` text,
	`parent_phone` text,
	`political_status` text,
	`is_member` integer DEFAULT 0 NOT NULL,
	`is_activist` integer DEFAULT 0 NOT NULL,
	`remark` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_students_class` ON `students` (`class_name`);--> statement-breakpoint
CREATE TABLE `training_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activist_id` integer NOT NULL,
	`topic` text NOT NULL,
	`trained_at` text NOT NULL,
	`content` text,
	`attendance` text,
	`performance` text,
	`completed` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_training_activist` ON `training_records` (`activist_id`);--> statement-breakpoint
CREATE TABLE `youth_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer NOT NULL,
	`joined_at` text NOT NULL,
	`member_no` text,
	`organization` text,
	`status` text NOT NULL,
	`remark` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_youth_members_student` ON `youth_members` (`student_id`);