CREATE TABLE "artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_object_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"file_type" text,
	"version" integer DEFAULT 1 NOT NULL,
	"event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_work_object_id_work_objects_id_fk" FOREIGN KEY ("work_object_id") REFERENCES "public"."work_objects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "artifacts_work_object_idx" ON "artifacts" USING btree ("work_object_id");
--> statement-breakpoint
CREATE INDEX "artifacts_version_idx" ON "artifacts" USING btree ("work_object_id","version");
