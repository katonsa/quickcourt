-- Enforce one Organization membership per user. Better Auth membership access
-- treats this pair as the identity boundary for an Organization member.
CREATE UNIQUE INDEX "member_organizationId_userId_key"
ON "member"("organizationId", "userId");

-- Enforce one pending owner invitation per Organization/email pair. Expired
-- pending owner invitations are canceled by the service before reinvite so
-- they do not block a fresh invitation.
CREATE UNIQUE INDEX "uq_pending_owner_invitation_per_email"
ON "invitation"("organizationId", lower("email"), "role")
WHERE "status" = 'pending' AND "role" = 'owner';
