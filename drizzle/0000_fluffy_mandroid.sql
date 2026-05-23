CREATE TYPE "public"."role" AS ENUM('requester', 'designer', 'creative_lead', 'creative_director', 'project_manager', 'account_manager', 'resource_manager', 'operations', 'admin');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('exploration', 'production');--> statement-breakpoint
CREATE TYPE "public"."work_object_type" AS ENUM('initiative', 'project', 'workstream', 'deliverable', 'commitment', 'action');--> statement-breakpoint
CREATE TYPE "public"."work_status" AS ENUM('requested', 'clarifying', 'shaping', 'exploring', 'ready_for_production', 'in_production', 'in_review', 'waiting', 'delivered', 'closing', 'closed', 'archived');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_object_id" uuid NOT NULL,
	"type" text NOT NULL,
	"actor_id" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "people_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"role" "role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_object_id" uuid NOT NULL,
	"person_id" uuid,
	"hours" double precision NOT NULL,
	"note" text,
	"event_id" uuid,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "work_object_type" NOT NULL,
	"parent_id" uuid,
	"tier" integer,
	"status" "work_status" DEFAULT 'requested' NOT NULL,
	"mode" "work_mode",
	"title" text NOT NULL,
	"why" text,
	"requester_id" uuid,
	"owner_id" uuid,
	"decider_id" uuid,
	"due_at" timestamp with time zone,
	"effort_budget_hours" double precision,
	"definition_of_done" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_work_object_id_work_objects_id_fk" FOREIGN KEY ("work_object_id") REFERENCES "public"."work_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_actor_id_people_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_work_object_id_work_objects_id_fk" FOREIGN KEY ("work_object_id") REFERENCES "public"."work_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_objects" ADD CONSTRAINT "work_objects_parent_id_work_objects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."work_objects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_objects" ADD CONSTRAINT "work_objects_requester_id_people_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_objects" ADD CONSTRAINT "work_objects_owner_id_people_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_objects" ADD CONSTRAINT "work_objects_decider_id_people_id_fk" FOREIGN KEY ("decider_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_work_object_idx" ON "events" USING btree ("work_object_id");--> statement-breakpoint
CREATE INDEX "events_created_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "role_assignments_person_idx" ON "role_assignments" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "time_entries_work_object_idx" ON "time_entries" USING btree ("work_object_id");--> statement-breakpoint
CREATE INDEX "work_objects_parent_idx" ON "work_objects" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "work_objects_status_idx" ON "work_objects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "work_objects_owner_idx" ON "work_objects" USING btree ("owner_id");