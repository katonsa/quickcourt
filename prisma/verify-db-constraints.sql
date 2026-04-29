DO $$
DECLARE
  object_name text;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOREACH object_name IN ARRAY ARRAY['pgcrypto', 'citext', 'btree_gist']
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_extension
      WHERE extname = object_name
    ) THEN
      missing := array_append(missing, object_name);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing required PostgreSQL extensions: %', array_to_string(missing, ', ');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user'
      AND a.attname = 'email'
      AND NOT a.attisdropped
      AND format_type(a.atttypid, a.atttypmod) = 'citext'
  ) THEN
    RAISE EXCEPTION 'Expected public.user.email to use citext';
  END IF;
END
$$;

DO $$
DECLARE
  index_record record;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOR index_record IN
    SELECT *
    FROM (
      VALUES
        (
          'uq_one_default_branch_per_venue',
          'CREATE UNIQUE INDEX uq_one_default_branch_per_venue ON public.venue_branches USING btree (venue_id) WHERE ((is_default = true) AND (deleted_at IS NULL))'
        ),
        (
          'uq_one_primary_bank_account_per_venue',
          'CREATE UNIQUE INDEX uq_one_primary_bank_account_per_venue ON public.venue_bank_accounts USING btree (venue_id) WHERE ((is_primary = true) AND (deleted_at IS NULL))'
        ),
        (
          'uq_one_cover_photo_per_court',
          'CREATE UNIQUE INDEX uq_one_cover_photo_per_court ON public.court_photos USING btree (court_id) WHERE (is_cover = true)'
        ),
        (
          'uq_one_cover_photo_per_venue',
          'CREATE UNIQUE INDEX uq_one_cover_photo_per_venue ON public.venue_photos USING btree (venue_id) WHERE ((is_cover = true) AND (branch_id IS NULL))'
        ),
        (
          'uq_one_cover_photo_per_branch',
          'CREATE UNIQUE INDEX uq_one_cover_photo_per_branch ON public.venue_photos USING btree (branch_id) WHERE ((is_cover = true) AND (branch_id IS NOT NULL))'
        ),
        (
          'uq_active_court_name_per_branch',
          'CREATE UNIQUE INDEX uq_active_court_name_per_branch ON public.courts USING btree (branch_id, name) WHERE (deleted_at IS NULL)'
        ),
        (
          'uq_one_check_in_per_booking',
          'CREATE UNIQUE INDEX uq_one_check_in_per_booking ON public.booking_check_ins USING btree (booking_id) WHERE (booking_slot_id IS NULL)'
        ),
        (
          'uq_one_check_in_per_booking_slot',
          'CREATE UNIQUE INDEX uq_one_check_in_per_booking_slot ON public.booking_check_ins USING btree (booking_slot_id) WHERE (booking_slot_id IS NOT NULL)'
        ),
        (
          'uq_payment_webhook_idempotency_key',
          'CREATE UNIQUE INDEX uq_payment_webhook_idempotency_key ON public.payment_webhook_events USING btree (idempotency_key)'
        ),
        (
          'uq_venue_ledger_entry_idempotency_key',
          'CREATE UNIQUE INDEX uq_venue_ledger_entry_idempotency_key ON public.venue_ledger_entries USING btree (idempotency_key)'
        ),
        (
          'member_organizationId_userId_key',
          'CREATE UNIQUE INDEX "member_organizationId_userId_key" ON public.member USING btree ("organizationId", "userId")'
        ),
        (
          'uq_pending_owner_invitation_per_email',
          'CREATE UNIQUE INDEX uq_pending_owner_invitation_per_email ON public.invitation USING btree ("organizationId", lower(email), role) WHERE ((status = ''pending''::text) AND (role = ''owner''::text))'
        )
    ) AS expected(indexname, indexdef)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = index_record.indexname
        AND indexdef = index_record.indexdef
    ) THEN
      missing := array_append(missing, index_record.indexname);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing or mismatched required indexes: %', array_to_string(missing, ', ');
  END IF;
END
$$;

DO $$
DECLARE
  object_name text;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOREACH object_name IN ARRAY ARRAY['booking_slots', 'court_availability_blocks']
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE n.nspname = 'public'
        AND c.relname = object_name
        AND a.attname = 'time_range'
        AND NOT a.attisdropped
        AND format_type(a.atttypid, a.atttypmod) = 'tstzrange'
        AND a.attgenerated = 's'
        AND pg_get_expr(d.adbin, d.adrelid) = 'tstzrange(starts_at, ends_at, ''[)''::text)'
    ) THEN
      missing := array_append(missing, object_name || '.time_range');
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing generated tstzrange columns: %', array_to_string(missing, ', ');
  END IF;
END
$$;

DO $$
DECLARE
  constraint_record record;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOR constraint_record IN
    SELECT *
    FROM (
      VALUES
        (
          'no_overlapping_active_booking_slots',
          'EXCLUDE USING gist (court_id WITH =, time_range WITH &&) WHERE ((status = ANY (ARRAY[''pending''::"BookingSlotStatus", ''confirmed''::"BookingSlotStatus", ''completed''::"BookingSlotStatus"])))'
        ),
        (
          'no_overlapping_active_availability_blocks',
          'EXCLUDE USING gist (court_id WITH =, time_range WITH &&) WHERE ((status = ''active''::"AvailabilityBlockStatus"))'
        )
    ) AS expected(conname, definition)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = constraint_record.conname
        AND contype = 'x'
        AND pg_get_constraintdef(oid) = constraint_record.definition
    ) THEN
      missing := array_append(missing, constraint_record.conname);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing or mismatched required exclusion constraints: %', array_to_string(missing, ', ');
  END IF;
END
$$;

DO $$
DECLARE
  constraint_record record;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOR constraint_record IN
    SELECT *
    FROM (
      VALUES
        (
          'chk_day_of_week',
          'CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))'
        ),
        (
          'chk_open_close_time',
          'CHECK (((is_closed = true) OR ((open_time IS NOT NULL) AND (close_time IS NOT NULL) AND (open_time < close_time))))'
        ),
        (
          'chk_price_rule_day_of_week',
          'CHECK (((day_of_week IS NULL) OR ((day_of_week >= 0) AND (day_of_week <= 6))))'
        ),
        (
          'chk_booking_slot_time',
          'CHECK ((starts_at < ends_at))'
        ),
        (
          'chk_review_rating',
          'CHECK (((rating >= 1) AND (rating <= 5)))'
        )
    ) AS expected(conname, definition)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = constraint_record.conname
        AND contype = 'c'
        AND pg_get_constraintdef(oid) = constraint_record.definition
    ) THEN
      missing := array_append(missing, constraint_record.conname);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing or mismatched required check constraints: %', array_to_string(missing, ', ');
  END IF;
END
$$;

SELECT 'QuickCourt database constraints verified' AS status;
