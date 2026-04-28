-- Prisma creates these Unsupported tstzrange fields as regular nullable
-- columns. PostgreSQL generated columns are the source of truth for overlap
-- constraints, so this migration replaces them explicitly.
ALTER TABLE "booking_slots" DROP COLUMN IF EXISTS "time_range";
ALTER TABLE "booking_slots"
ADD COLUMN "time_range" tstzrange GENERATED ALWAYS AS (
  tstzrange("starts_at", "ends_at", '[)')
) STORED;

ALTER TABLE "court_availability_blocks" DROP COLUMN IF EXISTS "time_range";
ALTER TABLE "court_availability_blocks"
ADD COLUMN "time_range" tstzrange GENERATED ALWAYS AS (
  tstzrange("starts_at", "ends_at", '[)')
) STORED;

CREATE UNIQUE INDEX "uq_one_default_branch_per_venue"
ON "venue_branches"("venue_id")
WHERE "is_default" = true AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "uq_one_primary_bank_account_per_venue"
ON "venue_bank_accounts"("venue_id")
WHERE "is_primary" = true AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "uq_one_cover_photo_per_court"
ON "court_photos"("court_id")
WHERE "is_cover" = true;

CREATE UNIQUE INDEX "uq_one_cover_photo_per_venue"
ON "venue_photos"("venue_id")
WHERE "is_cover" = true AND "branch_id" IS NULL;

CREATE UNIQUE INDEX "uq_one_cover_photo_per_branch"
ON "venue_photos"("branch_id")
WHERE "is_cover" = true AND "branch_id" IS NOT NULL;

CREATE UNIQUE INDEX "uq_active_court_name_per_branch"
ON "courts"("branch_id", "name")
WHERE "deleted_at" IS NULL;

CREATE UNIQUE INDEX "uq_one_check_in_per_booking"
ON "booking_check_ins"("booking_id")
WHERE "booking_slot_id" IS NULL;

CREATE UNIQUE INDEX "uq_one_check_in_per_booking_slot"
ON "booking_check_ins"("booking_slot_id")
WHERE "booking_slot_id" IS NOT NULL;

ALTER TABLE "booking_slots"
ADD CONSTRAINT "no_overlapping_active_booking_slots"
EXCLUDE USING gist (
  "court_id" WITH =,
  "time_range" WITH &&
)
WHERE ("status" IN ('pending', 'confirmed', 'completed'));

ALTER TABLE "court_availability_blocks"
ADD CONSTRAINT "no_overlapping_active_availability_blocks"
EXCLUDE USING gist (
  "court_id" WITH =,
  "time_range" WITH &&
)
WHERE ("status" = 'active');

ALTER TABLE "court_operating_hours"
ADD CONSTRAINT "chk_day_of_week"
CHECK ("day_of_week" BETWEEN 0 AND 6);

ALTER TABLE "court_operating_hours"
ADD CONSTRAINT "chk_open_close_time"
CHECK (
  "is_closed" = true
  OR (
    "open_time" IS NOT NULL
    AND "close_time" IS NOT NULL
    AND "open_time" < "close_time"
  )
);

ALTER TABLE "court_price_rules"
ADD CONSTRAINT "chk_price_rule_day_of_week"
CHECK ("day_of_week" IS NULL OR "day_of_week" BETWEEN 0 AND 6);

ALTER TABLE "booking_slots"
ADD CONSTRAINT "chk_booking_slot_time"
CHECK ("starts_at" < "ends_at");

ALTER TABLE "reviews"
ADD CONSTRAINT "chk_review_rating"
CHECK ("rating" BETWEEN 1 AND 5);
