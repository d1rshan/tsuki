import { neon } from "@neondatabase/serverless";
import { env } from "@tsuki/env/db";

const sql = neon(env.DATABASE_URL);

const statements = [
  `CREATE OR REPLACE FUNCTION "public"."record_progress_activity"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
	progress_added integer;
BEGIN
	IF TG_OP = 'INSERT' THEN
		progress_added := NEW.progress;
	ELSE
		progress_added := NEW.progress - OLD.progress;
	END IF;

	IF progress_added > 0 THEN
		INSERT INTO public.progress_activity (user_id, media_type, amount)
		VALUES (NEW.user_id, NEW.media_type, progress_added)
		ON CONFLICT (user_id, media_type, activity_date)
		DO UPDATE SET amount = progress_activity.amount + EXCLUDED.amount;
	END IF;

	RETURN NEW;
END;
$$;`,
  `DROP TRIGGER IF EXISTS "record_progress_activity" ON "public"."library_entries";`,
  `CREATE TRIGGER "record_progress_activity"
AFTER INSERT OR UPDATE OF "progress" ON "public"."library_entries"
FOR EACH ROW
EXECUTE FUNCTION "public"."record_progress_activity"();`,
];

for (const statement of statements) {
  await sql.query(statement);
}
console.log(`Applied ${statements.length} trigger statements.`);
