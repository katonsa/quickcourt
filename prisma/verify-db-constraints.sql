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
  object_name text;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOREACH object_name IN ARRAY ARRAY[
    'uq_one_default_branch_per_venue',
    'uq_one_primary_bank_account_per_venue',
    'uq_one_cover_photo_per_court',
    'uq_one_cover_photo_per_venue',
    'uq_one_cover_photo_per_branch',
    'uq_active_court_name_per_branch',
    'uq_one_check_in_per_booking',
    'uq_one_check_in_per_booking_slot',
    'uq_payment_webhook_idempotency_key',
    'uq_venue_ledger_entry_idempotency_key'
  ]
  LOOP
    IF to_regclass(format('public.%I', object_name)) IS NULL THEN
      missing := array_append(missing, object_name);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing required indexes: %', array_to_string(missing, ', ');
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
        AND pg_get_expr(d.adbin, d.adrelid) LIKE 'tstzrange(%'
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
  object_name text;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOREACH object_name IN ARRAY ARRAY[
    'no_overlapping_active_booking_slots',
    'no_overlapping_active_availability_blocks'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = object_name
        AND contype = 'x'
    ) THEN
      missing := array_append(missing, object_name);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing required exclusion constraints: %', array_to_string(missing, ', ');
  END IF;
END
$$;

DO $$
DECLARE
  object_name text;
  missing text[] := ARRAY[]::text[];
BEGIN
  FOREACH object_name IN ARRAY ARRAY[
    'chk_day_of_week',
    'chk_open_close_time',
    'chk_price_rule_day_of_week',
    'chk_booking_slot_time',
    'chk_review_rating'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = object_name
        AND contype = 'c'
    ) THEN
      missing := array_append(missing, object_name);
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Missing required check constraints: %', array_to_string(missing, ', ');
  END IF;
END
$$;

SELECT 'QuickCourt database constraints verified' AS status;
