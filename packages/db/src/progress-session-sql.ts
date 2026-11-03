export const statements = [
  `DROP TRIGGER IF EXISTS record_progress_activity ON public.library`,
  `DROP FUNCTION IF EXISTS public.record_progress_activity()`,
  `DROP TABLE IF EXISTS public.progress`,
  `CREATE EXTENSION IF NOT EXISTS btree_gist`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_no_overlap') THEN
      ALTER TABLE public.progress_session ADD CONSTRAINT session_no_overlap
      EXCLUDE USING gist (user_id WITH =, media_id WITH =, int4range(start_number, end_number, '[]') WITH &&);
    END IF;
  END $$`,
  `CREATE OR REPLACE FUNCTION public.record_progress_session() RETURNS trigger LANGUAGE plpgsql AS $$
  DECLARE previous integer := 0;
  BEGIN
    IF current_setting('tsuki.reconciling', true) = 'on' THEN RETURN NEW; END IF;
    IF TG_OP = 'UPDATE' THEN previous := OLD.progress; END IF;
    IF NEW.progress > previous THEN
      INSERT INTO public.progress_session(id,user_id,media_id,media_type,start_number,end_number,activity_date)
      VALUES(gen_random_uuid()::text,NEW.user_id,NEW.media_id,NEW.media_type,previous+1,NEW.progress,NEW.progress_date);
    ELSIF NEW.progress < previous AND NEW.progress <> COALESCE((SELECT max(end_number) FROM public.progress_session WHERE user_id=NEW.user_id AND media_id=NEW.media_id),0) THEN
      RAISE EXCEPTION 'Correct individual progress sessions to lower progress' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
  END $$`,
  `DROP TRIGGER IF EXISTS record_progress_session ON public.library`,
  `CREATE TRIGGER record_progress_session AFTER INSERT OR UPDATE OF progress ON public.library FOR EACH ROW EXECUTE FUNCTION public.record_progress_session()`,
  `CREATE OR REPLACE FUNCTION public.change_progress_session(owner_id text, title_id integer, session_id text, first_number integer, last_number integer, consumed_date date, remove_session boolean)
  RETURNS void LANGUAGE plpgsql AS $$
  DECLARE old_first integer; old_last integer; next_progress integer; known_total integer;
  BEGIN
    PERFORM 1 FROM public.library WHERE user_id=owner_id AND media_id=title_id FOR UPDATE;
    SELECT start_number,end_number INTO old_first,old_last FROM public.progress_session WHERE id=session_id AND user_id=owner_id AND media_id=title_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Session not found' USING ERRCODE='P0002'; END IF;
    IF remove_session THEN
      DELETE FROM public.progress_session WHERE id=session_id AND user_id=owner_id;
    ELSE
      UPDATE public.progress_session SET start_number=first_number,end_number=last_number,activity_date=consumed_date,updated_at=now() WHERE id=session_id AND user_id=owner_id;
    END IF;
    IF remove_session OR old_first IS DISTINCT FROM first_number OR old_last IS DISTINCT FROM last_number THEN
      -- Disable automatic session creation for this reconciliation by using a
      -- transaction-local flag consumed by the trigger.
      PERFORM set_config('tsuki.reconciling', 'on', true);
      SELECT COALESCE(max(end_number),0) INTO next_progress FROM public.progress_session WHERE user_id=owner_id AND media_id=title_id;
      SELECT CASE WHEN media.type = 'ANIME' THEN media.episodes ELSE media.chapters END
        INTO known_total FROM public.media
        JOIN public.library ON library.media_id=media.id AND library.media_type=media.type
        WHERE library.user_id=owner_id AND library.media_id=title_id;
      UPDATE public.library SET
        status=CASE WHEN next_progress > progress AND known_total > 0 AND next_progress >= known_total THEN 'COMPLETED' ELSE status END,
        progress=next_progress,updated_at=now()
        WHERE user_id=owner_id AND media_id=title_id;
      PERFORM set_config('tsuki.reconciling', 'off', true);
    END IF;
  END $$`,
];
