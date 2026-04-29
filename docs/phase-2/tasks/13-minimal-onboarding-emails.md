# P2-13 — Minimal Onboarding Emails

## Goal

Add minimal transactional emails needed by Phase 2 onboarding.

## Context

Phase 1 established the email sender abstraction. Phase 2 should reuse it for owner invitation and minimal onboarding/bank status messages.

## Scope

- Owner invitation email.
- Minimal bank account verified/rejected email if useful.
- Minimal onboarding status email if triggered by a concrete service event.
- Development console fallback through existing email sender abstraction.
- Safe email content without sensitive bank account numbers.

## Out of Scope

- Booking/payment/refund/withdrawal notifications.
- Notification preferences.
- Email reminder cron.
- React Email adoption unless already locally conventional.

## Dependencies

- P2-03 Owner Invitation Flow.
- P2-11 Manual Bank Verification.

## Implementation Steps

1. Review existing email sender abstraction from Phase 1.
2. Add owner invitation email template/function consumed by the P2-03 invitation flow.
3. Add minimal bank verification status email template/function if implemented.
4. Ensure emails do not include full bank account numbers.
5. Add tests for routing, template data, and provider selection where appropriate.

## Acceptance Criteria

- Owner invitation sends through the shared email abstraction.
- Development fallback works without production Resend credentials.
- Production still uses Resend configuration.
- Email content does not leak full account numbers or internal tokens outside intended links.

## Test Requirements

- Unit tests for email sender calls and template rendering.
- Integration tests only if the invitation flow requires DB-backed assertions.

## Definition of Done

Phase 2 emails are minimal, safe, and consistent with the Phase 1 email foundation.
