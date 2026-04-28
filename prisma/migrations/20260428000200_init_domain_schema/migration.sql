-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'suspended', 'banned', 'closed');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unverified', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "BranchStatus" AS ENUM ('active', 'inactive', 'suspended', 'closed');

-- CreateEnum
CREATE TYPE "IndoorOutdoor" AS ENUM ('indoor', 'outdoor', 'semi_indoor');

-- CreateEnum
CREATE TYPE "CourtStatus" AS ENUM ('active', 'inactive', 'maintenance', 'deleted');

-- CreateEnum
CREATE TYPE "PriceRuleType" AS ENUM ('weekday', 'weekend', 'peak_hour', 'custom');

-- CreateEnum
CREATE TYPE "AvailabilityBlockStatus" AS ENUM ('active', 'cancelled');

-- CreateEnum
CREATE TYPE "AvailabilityBlockType" AS ENUM ('maintenance', 'event', 'reserved', 'closed');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('online', 'walk_in', 'admin_created');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show', 'expired');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'expired', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "BookingSlotStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "CancellationActorType" AS ENUM ('customer', 'venue_owner', 'venue_staff', 'super_admin', 'system');

-- CreateEnum
CREATE TYPE "CancellationStatus" AS ENUM ('requested', 'processed', 'rejected');

-- CreateEnum
CREATE TYPE "CheckInMethod" AS ENUM ('qr', 'manual');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('xendit');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('qris', 'bank_transfer', 'credit_card', 'debit_card', 'ewallet', 'retail_outlet', 'other');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('pending', 'processed', 'failed', 'ignored');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('booking_gross_credit', 'platform_commission_debit', 'gateway_fee_debit', 'refund_debit', 'withdrawal_debit', 'withdrawal_fee_debit', 'manual_adjustment_credit', 'manual_adjustment_debit');

-- CreateEnum
CREATE TYPE "LedgerEntryStatus" AS ENUM ('pending', 'available', 'settled', 'cancelled');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('requested', 'approved', 'processing', 'paid', 'rejected', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'issued', 'paid', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('published', 'hidden', 'reported', 'deleted');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'whatsapp');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('booking_confirmation', 'booking_reminder', 'booking_cancelled', 'payment_success', 'payment_failed', 'refund_processed', 'staff_invitation', 'venue_approval', 'withdrawal_update');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('before_booking');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('scheduled', 'sent', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ApprovalRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "SuspensionStatus" AS ENUM ('active', 'expired', 'revoked');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "phone_number" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "date_of_birth" DATE,
    "gender" "Gender",
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "province_name" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "legal_business_name" TEXT,
    "tax_number" TEXT,
    "status" "VenueStatus" NOT NULL DEFAULT 'draft',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'unverified',
    "default_commission_bps" INTEGER,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMPTZ(6),
    "approved_by_user_id" TEXT,
    "suspended_at" TIMESTAMPTZ(6),
    "suspended_by_user_id" TEXT,
    "suspension_reason" TEXT,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "google_maps_place_id" TEXT,
    "google_maps_embed_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "phone_number" TEXT,
    "email" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "BranchStatus" NOT NULL DEFAULT 'active',
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "venue_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_sports" (
    "venue_id" UUID NOT NULL,
    "sport_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_sports_pkey" PRIMARY KEY ("venue_id","sport_id")
);

-- CreateTable
CREATE TABLE "venue_facilities" (
    "venue_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_facilities_pkey" PRIMARY KEY ("venue_id","facility_id")
);

-- CreateTable
CREATE TABLE "venue_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "branch_id" UUID,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_bank_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "bank_name" TEXT NOT NULL,
    "bank_code" TEXT,
    "account_number" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "venue_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_branch_access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" TEXT NOT NULL,
    "branch_id" UUID NOT NULL,
    "can_view_schedule" BOOLEAN NOT NULL DEFAULT true,
    "can_manage_bookings" BOOLEAN NOT NULL DEFAULT false,
    "can_scan_check_in" BOOLEAN NOT NULL DEFAULT false,
    "can_view_finance" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "member_branch_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "sport_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "court_type" TEXT,
    "surface_type" TEXT,
    "indoor_outdoor" "IndoorOutdoor",
    "base_price_amount" BIGINT NOT NULL,
    "slot_duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "status" "CourtStatus" NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "court_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_operating_hours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TIME(6),
    "close_time" TIME(6),
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "court_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_price_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rule_type" "PriceRuleType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "day_of_week" INTEGER,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "valid_from" DATE,
    "valid_until" DATE,
    "price_amount" BIGINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "court_price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "court_availability_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "time_range" tstzrange,
    "reason" TEXT,
    "block_type" "AvailabilityBlockType" NOT NULL DEFAULT 'maintenance',
    "status" "AvailabilityBlockStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "court_availability_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_code" TEXT NOT NULL,
    "customer_user_id" TEXT,
    "venue_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "customer_email" TEXT,
    "source" "BookingSource" NOT NULL DEFAULT 'online',
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_payment',
    "payment_status" "BookingPaymentStatus" NOT NULL DEFAULT 'unpaid',
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "subtotal_amount" BIGINT NOT NULL DEFAULT 0,
    "platform_fee_amount" BIGINT NOT NULL DEFAULT 0,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "total_amount" BIGINT NOT NULL DEFAULT 0,
    "platform_commission_bps" INTEGER NOT NULL DEFAULT 0,
    "platform_commission_amount" BIGINT NOT NULL DEFAULT 0,
    "venue_net_amount" BIGINT NOT NULL DEFAULT 0,
    "customer_notes" TEXT,
    "internal_notes" TEXT,
    "cancellation_policy_snapshot" JSONB,
    "expires_at" TIMESTAMPTZ(6),
    "confirmed_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "cancelled_by_user_id" TEXT,
    "cancellation_reason" TEXT,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "court_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "venue_timezone" TEXT NOT NULL,
    "local_date" DATE NOT NULL,
    "local_start_time" TIME(6) NOT NULL,
    "local_end_time" TIME(6) NOT NULL,
    "time_range" tstzrange,
    "duration_minutes" INTEGER NOT NULL,
    "price_amount" BIGINT NOT NULL,
    "price_rule_id" UUID,
    "price_snapshot" JSONB,
    "status" "BookingSlotStatus" NOT NULL DEFAULT 'pending',
    "checked_in_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "booking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_cancellations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "requested_by_user_id" TEXT,
    "actor_type" "CancellationActorType" NOT NULL,
    "reason" TEXT,
    "status" "CancellationStatus" NOT NULL DEFAULT 'processed',
    "refund_amount" BIGINT NOT NULL DEFAULT 0,
    "penalty_amount" BIGINT NOT NULL DEFAULT 0,
    "policy_snapshot" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "booking_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_check_ins" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "booking_slot_id" UUID,
    "customer_user_id" TEXT,
    "checked_in_by_user_id" TEXT,
    "method" "CheckInMethod" NOT NULL DEFAULT 'manual',
    "qr_token_hash" TEXT,
    "checked_in_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "customer_user_id" TEXT,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'xendit',
    "external_id" TEXT NOT NULL,
    "gateway_invoice_id" TEXT,
    "gateway_payment_id" TEXT,
    "payment_method" "PaymentMethod",
    "payment_channel" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "amount" BIGINT NOT NULL,
    "gateway_fee_amount" BIGINT NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "invoice_url" TEXT,
    "checkout_url" TEXT,
    "paid_at" TIMESTAMPTZ(6),
    "expired_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "failure_reason" TEXT,
    "raw_request" JSONB,
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gateway" TEXT NOT NULL DEFAULT 'xendit',
    "event_type" TEXT NOT NULL,
    "event_id" TEXT,
    "external_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "payment_id" UUID,
    "booking_id" UUID,
    "payload" JSONB NOT NULL,
    "processing_status" "WebhookProcessingStatus" NOT NULL DEFAULT 'pending',
    "processed_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "customer_user_id" TEXT,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'xendit',
    "gateway_refund_id" TEXT,
    "external_refund_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "amount" BIGINT NOT NULL,
    "reason" TEXT,
    "policy_snapshot" JSONB,
    "status" "RefundStatus" NOT NULL DEFAULT 'pending',
    "requested_by_user_id" TEXT,
    "processed_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "failure_reason" TEXT,
    "raw_request" JSONB,
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_ledger_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "branch_id" UUID,
    "booking_id" UUID,
    "payment_id" UUID,
    "refund_id" UUID,
    "withdrawal_id" UUID,
    "idempotency_key" TEXT NOT NULL,
    "entry_type" "LedgerEntryType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "amount_delta" BIGINT NOT NULL,
    "status" "LedgerEntryStatus" NOT NULL DEFAULT 'pending',
    "available_at" TIMESTAMPTZ(6),
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venue_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "bank_account_id" UUID NOT NULL,
    "requested_by_user_id" TEXT NOT NULL,
    "processed_by_user_id" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "amount" BIGINT NOT NULL,
    "fee_amount" BIGINT NOT NULL DEFAULT 0,
    "net_amount" BIGINT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'requested',
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'xendit',
    "gateway_disbursement_id" TEXT,
    "external_id" TEXT,
    "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(6),
    "processed_at" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "rejection_reason" TEXT,
    "failure_reason" TEXT,
    "raw_request" JSONB,
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_ledger_entries" (
    "withdrawal_id" UUID NOT NULL,
    "ledger_entry_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawal_ledger_entries_pkey" PRIMARY KEY ("withdrawal_id","ledger_entry_id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "payment_id" UUID,
    "invoice_number" TEXT NOT NULL,
    "customer_user_id" TEXT,
    "venue_id" UUID NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "subtotal_amount" BIGINT NOT NULL,
    "discount_amount" BIGINT NOT NULL DEFAULT 0,
    "total_amount" BIGINT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'issued',
    "pdf_url" TEXT,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "booking_slot_id" UUID,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_amount" BIGINT NOT NULL,
    "total_amount" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "customer_user_id" TEXT NOT NULL,
    "venue_id" UUID NOT NULL,
    "branch_id" UUID,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'published',
    "published_at" TIMESTAMPTZ(6),
    "hidden_at" TIMESTAMPTZ(6),
    "hidden_by_user_id" TEXT,
    "hide_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "booking_id" UUID,
    "payment_id" UUID,
    "refund_id" UUID,
    "withdrawal_id" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT,
    "provider" TEXT,
    "provider_message_id" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_reminders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "customer_user_id" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "reminder_type" "ReminderType" NOT NULL DEFAULT 'before_booking',
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'scheduled',
    "notification_log_id" UUID,
    "sent_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "booking_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_approval_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "submitted_by_user_id" TEXT NOT NULL,
    "reviewed_by_user_id" TEXT,
    "status" "ApprovalRequestStatus" NOT NULL DEFAULT 'pending',
    "submission_notes" TEXT,
    "review_notes" TEXT,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "venue_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_suspensions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "suspended_by_user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMPTZ(6),
    "status" "SuspensionStatus" NOT NULL DEFAULT 'active',
    "revoked_by_user_id" TEXT,
    "revoked_at" TIMESTAMPTZ(6),
    "revoke_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_suspensions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "suspended_by_user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMPTZ(6),
    "status" "SuspensionStatus" NOT NULL DEFAULT 'active',
    "revoked_by_user_id" TEXT,
    "revoked_at" TIMESTAMPTZ(6),
    "revoke_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "venue_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "before_data" JSONB,
    "after_data" JSONB,
    "metadata" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "member"("organizationId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "invitation"("organizationId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE INDEX "user_profiles_phone_number_idx" ON "user_profiles"("phone_number");

-- CreateIndex
CREATE INDEX "user_profiles_status_idx" ON "user_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sports_slug_key" ON "sports"("slug");

-- CreateIndex
CREATE INDEX "sports_is_active_idx" ON "sports"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_province_name_idx" ON "cities"("province_name");

-- CreateIndex
CREATE INDEX "cities_is_active_idx" ON "cities"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_slug_key" ON "facilities"("slug");

-- CreateIndex
CREATE INDEX "facilities_is_active_idx" ON "facilities"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "venues_organization_id_key" ON "venues"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "venues_slug_key" ON "venues"("slug");

-- CreateIndex
CREATE INDEX "venues_organization_id_idx" ON "venues"("organization_id");

-- CreateIndex
CREATE INDEX "venues_status_idx" ON "venues"("status");

-- CreateIndex
CREATE INDEX "venues_verification_status_idx" ON "venues"("verification_status");

-- CreateIndex
CREATE INDEX "venues_average_rating_idx" ON "venues"("average_rating");

-- CreateIndex
CREATE INDEX "venue_branches_venue_id_idx" ON "venue_branches"("venue_id");

-- CreateIndex
CREATE INDEX "venue_branches_city_id_idx" ON "venue_branches"("city_id");

-- CreateIndex
CREATE INDEX "venue_branches_status_idx" ON "venue_branches"("status");

-- CreateIndex
CREATE INDEX "venue_branches_latitude_longitude_idx" ON "venue_branches"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "venue_sports_sport_id_idx" ON "venue_sports"("sport_id");

-- CreateIndex
CREATE INDEX "venue_photos_venue_id_idx" ON "venue_photos"("venue_id");

-- CreateIndex
CREATE INDEX "venue_photos_branch_id_idx" ON "venue_photos"("branch_id");

-- CreateIndex
CREATE INDEX "venue_bank_accounts_venue_id_idx" ON "venue_bank_accounts"("venue_id");

-- CreateIndex
CREATE INDEX "member_branch_access_branch_id_idx" ON "member_branch_access"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_branch_access_member_id_branch_id_key" ON "member_branch_access"("member_id", "branch_id");

-- CreateIndex
CREATE INDEX "courts_venue_id_idx" ON "courts"("venue_id");

-- CreateIndex
CREATE INDEX "courts_branch_id_idx" ON "courts"("branch_id");

-- CreateIndex
CREATE INDEX "courts_sport_id_idx" ON "courts"("sport_id");

-- CreateIndex
CREATE INDEX "courts_status_idx" ON "courts"("status");

-- CreateIndex
CREATE INDEX "courts_base_price_amount_idx" ON "courts"("base_price_amount");

-- CreateIndex
CREATE INDEX "court_photos_court_id_idx" ON "court_photos"("court_id");

-- CreateIndex
CREATE INDEX "court_operating_hours_court_id_idx" ON "court_operating_hours"("court_id");

-- CreateIndex
CREATE UNIQUE INDEX "court_operating_hours_court_id_day_of_week_key" ON "court_operating_hours"("court_id", "day_of_week");

-- CreateIndex
CREATE INDEX "court_price_rules_court_id_idx" ON "court_price_rules"("court_id");

-- CreateIndex
CREATE INDEX "court_price_rules_is_active_idx" ON "court_price_rules"("is_active");

-- CreateIndex
CREATE INDEX "court_price_rules_court_id_day_of_week_start_time_end_time__idx" ON "court_price_rules"("court_id", "day_of_week", "start_time", "end_time", "priority");

-- CreateIndex
CREATE INDEX "court_availability_blocks_court_id_starts_at_ends_at_idx" ON "court_availability_blocks"("court_id", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "court_availability_blocks_status_idx" ON "court_availability_blocks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_code_key" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "bookings_customer_user_id_idx" ON "bookings"("customer_user_id");

-- CreateIndex
CREATE INDEX "bookings_venue_id_idx" ON "bookings"("venue_id");

-- CreateIndex
CREATE INDEX "bookings_branch_id_idx" ON "bookings"("branch_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_payment_status_idx" ON "bookings"("payment_status");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- CreateIndex
CREATE INDEX "bookings_customer_user_id_status_created_at_idx" ON "bookings"("customer_user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "booking_slots_booking_id_idx" ON "booking_slots"("booking_id");

-- CreateIndex
CREATE INDEX "booking_slots_court_id_idx" ON "booking_slots"("court_id");

-- CreateIndex
CREATE INDEX "booking_slots_starts_at_ends_at_idx" ON "booking_slots"("starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "booking_slots_local_date_local_start_time_idx" ON "booking_slots"("local_date", "local_start_time");

-- CreateIndex
CREATE INDEX "booking_slots_status_idx" ON "booking_slots"("status");

-- CreateIndex
CREATE INDEX "booking_cancellations_booking_id_idx" ON "booking_cancellations"("booking_id");

-- CreateIndex
CREATE INDEX "booking_cancellations_actor_type_idx" ON "booking_cancellations"("actor_type");

-- CreateIndex
CREATE INDEX "booking_check_ins_booking_id_idx" ON "booking_check_ins"("booking_id");

-- CreateIndex
CREATE INDEX "booking_check_ins_booking_slot_id_idx" ON "booking_check_ins"("booking_slot_id");

-- CreateIndex
CREATE INDEX "booking_check_ins_checked_in_by_user_id_idx" ON "booking_check_ins"("checked_in_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_external_id_key" ON "payments"("external_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_customer_user_id_idx" ON "payments"("customer_user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_gateway_invoice_id_idx" ON "payments"("gateway_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_webhook_idempotency_key" ON "payment_webhook_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "payment_webhook_events_external_id_idx" ON "payment_webhook_events"("external_id");

-- CreateIndex
CREATE INDEX "payment_webhook_events_booking_id_idx" ON "payment_webhook_events"("booking_id");

-- CreateIndex
CREATE INDEX "payment_webhook_events_processing_status_idx" ON "payment_webhook_events"("processing_status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_gateway_event_id_key" ON "payment_webhook_events"("gateway", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_external_refund_id_key" ON "refunds"("external_refund_id");

-- CreateIndex
CREATE INDEX "refunds_booking_id_idx" ON "refunds"("booking_id");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_venue_ledger_entry_idempotency_key" ON "venue_ledger_entries"("idempotency_key");

-- CreateIndex
CREATE INDEX "venue_ledger_entries_venue_id_idx" ON "venue_ledger_entries"("venue_id");

-- CreateIndex
CREATE INDEX "venue_ledger_entries_branch_id_idx" ON "venue_ledger_entries"("branch_id");

-- CreateIndex
CREATE INDEX "venue_ledger_entries_booking_id_idx" ON "venue_ledger_entries"("booking_id");

-- CreateIndex
CREATE INDEX "venue_ledger_entries_status_idx" ON "venue_ledger_entries"("status");

-- CreateIndex
CREATE INDEX "venue_ledger_entries_available_at_idx" ON "venue_ledger_entries"("available_at");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_external_id_key" ON "withdrawals"("external_id");

-- CreateIndex
CREATE INDEX "withdrawals_venue_id_idx" ON "withdrawals"("venue_id");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "withdrawals_requested_at_idx" ON "withdrawals"("requested_at");

-- CreateIndex
CREATE INDEX "withdrawal_ledger_entries_ledger_entry_id_idx" ON "withdrawal_ledger_entries"("ledger_entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_booking_id_key" ON "invoices"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_booking_id_idx" ON "invoices"("booking_id");

-- CreateIndex
CREATE INDEX "invoices_venue_id_idx" ON "invoices"("venue_id");

-- CreateIndex
CREATE INDEX "invoices_customer_user_id_idx" ON "invoices"("customer_user_id");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "reviews_venue_id_idx" ON "reviews"("venue_id");

-- CreateIndex
CREATE INDEX "reviews_customer_user_id_idx" ON "reviews"("customer_user_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_customer_user_id_key" ON "reviews"("booking_id", "customer_user_id");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_idx" ON "notification_logs"("user_id");

-- CreateIndex
CREATE INDEX "notification_logs_booking_id_idx" ON "notification_logs"("booking_id");

-- CreateIndex
CREATE INDEX "notification_logs_channel_idx" ON "notification_logs"("channel");

-- CreateIndex
CREATE INDEX "notification_logs_notification_type_idx" ON "notification_logs"("notification_type");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_scheduled_at_idx" ON "notification_logs"("scheduled_at");

-- CreateIndex
CREATE INDEX "booking_reminders_booking_id_idx" ON "booking_reminders"("booking_id");

-- CreateIndex
CREATE INDEX "booking_reminders_scheduled_at_idx" ON "booking_reminders"("scheduled_at");

-- CreateIndex
CREATE INDEX "booking_reminders_status_idx" ON "booking_reminders"("status");

-- CreateIndex
CREATE INDEX "venue_approval_requests_venue_id_idx" ON "venue_approval_requests"("venue_id");

-- CreateIndex
CREATE INDEX "venue_approval_requests_status_idx" ON "venue_approval_requests"("status");

-- CreateIndex
CREATE INDEX "user_suspensions_user_id_idx" ON "user_suspensions"("user_id");

-- CreateIndex
CREATE INDEX "user_suspensions_status_idx" ON "user_suspensions"("status");

-- CreateIndex
CREATE INDEX "venue_suspensions_venue_id_idx" ON "venue_suspensions"("venue_id");

-- CreateIndex
CREATE INDEX "venue_suspensions_status_idx" ON "venue_suspensions"("status");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_suspended_by_user_id_fkey" FOREIGN KEY ("suspended_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_branches" ADD CONSTRAINT "venue_branches_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_branches" ADD CONSTRAINT "venue_branches_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_sports" ADD CONSTRAINT "venue_sports_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_sports" ADD CONSTRAINT "venue_sports_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_facilities" ADD CONSTRAINT "venue_facilities_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_facilities" ADD CONSTRAINT "venue_facilities_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_photos" ADD CONSTRAINT "venue_photos_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_photos" ADD CONSTRAINT "venue_photos_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "venue_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_bank_accounts" ADD CONSTRAINT "venue_bank_accounts_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_branch_access" ADD CONSTRAINT "member_branch_access_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_branch_access" ADD CONSTRAINT "member_branch_access_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "venue_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "venue_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courts" ADD CONSTRAINT "courts_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_photos" ADD CONSTRAINT "court_photos_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_operating_hours" ADD CONSTRAINT "court_operating_hours_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_price_rules" ADD CONSTRAINT "court_price_rules_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_availability_blocks" ADD CONSTRAINT "court_availability_blocks_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "court_availability_blocks" ADD CONSTRAINT "court_availability_blocks_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "venue_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_cancelled_by_user_id_fkey" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_slots" ADD CONSTRAINT "booking_slots_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_slots" ADD CONSTRAINT "booking_slots_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_slots" ADD CONSTRAINT "booking_slots_price_rule_id_fkey" FOREIGN KEY ("price_rule_id") REFERENCES "court_price_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_cancellations" ADD CONSTRAINT "booking_cancellations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_cancellations" ADD CONSTRAINT "booking_cancellations_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_check_ins" ADD CONSTRAINT "booking_check_ins_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_check_ins" ADD CONSTRAINT "booking_check_ins_booking_slot_id_fkey" FOREIGN KEY ("booking_slot_id") REFERENCES "booking_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_check_ins" ADD CONSTRAINT "booking_check_ins_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_check_ins" ADD CONSTRAINT "booking_check_ins_checked_in_by_user_id_fkey" FOREIGN KEY ("checked_in_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_ledger_entries" ADD CONSTRAINT "venue_ledger_entries_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_ledger_entries" ADD CONSTRAINT "venue_ledger_entries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "venue_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_ledger_entries" ADD CONSTRAINT "venue_ledger_entries_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_ledger_entries" ADD CONSTRAINT "venue_ledger_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_ledger_entries" ADD CONSTRAINT "venue_ledger_entries_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_ledger_entries" ADD CONSTRAINT "venue_ledger_entries_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "withdrawals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "venue_bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_processed_by_user_id_fkey" FOREIGN KEY ("processed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_ledger_entries" ADD CONSTRAINT "withdrawal_ledger_entries_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "withdrawals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_ledger_entries" ADD CONSTRAINT "withdrawal_ledger_entries_ledger_entry_id_fkey" FOREIGN KEY ("ledger_entry_id") REFERENCES "venue_ledger_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_booking_slot_id_fkey" FOREIGN KEY ("booking_slot_id") REFERENCES "booking_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "venue_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hidden_by_user_id_fkey" FOREIGN KEY ("hidden_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "withdrawals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reminders" ADD CONSTRAINT "booking_reminders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reminders" ADD CONSTRAINT "booking_reminders_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reminders" ADD CONSTRAINT "booking_reminders_notification_log_id_fkey" FOREIGN KEY ("notification_log_id") REFERENCES "notification_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_approval_requests" ADD CONSTRAINT "venue_approval_requests_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_approval_requests" ADD CONSTRAINT "venue_approval_requests_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_approval_requests" ADD CONSTRAINT "venue_approval_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_suspended_by_user_id_fkey" FOREIGN KEY ("suspended_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_revoked_by_user_id_fkey" FOREIGN KEY ("revoked_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_suspensions" ADD CONSTRAINT "venue_suspensions_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_suspensions" ADD CONSTRAINT "venue_suspensions_suspended_by_user_id_fkey" FOREIGN KEY ("suspended_by_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_suspensions" ADD CONSTRAINT "venue_suspensions_revoked_by_user_id_fkey" FOREIGN KEY ("revoked_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
