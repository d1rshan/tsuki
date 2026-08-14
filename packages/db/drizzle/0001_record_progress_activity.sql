CREATE FUNCTION "public"."record_progress_activity"()
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
$$;
--> statement-breakpoint
CREATE TRIGGER "record_progress_activity"
AFTER INSERT OR UPDATE OF "progress" ON "public"."library_entries"
FOR EACH ROW
EXECUTE FUNCTION "public"."record_progress_activity"();
