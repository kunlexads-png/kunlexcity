-- Add email verification fields to existing users.
ALTER TABLE "User"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "User"
ADD COLUMN "emailVerificationToken" TEXT;

ALTER TABLE "User"
ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);

-- Preserve access for every account that existed before this feature.
UPDATE "User"
SET "emailVerified" = true;

-- Ensure verification tokens are unique.
CREATE UNIQUE INDEX "User_emailVerificationToken_key"
ON "User"("emailVerificationToken");
