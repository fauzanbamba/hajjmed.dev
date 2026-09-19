ALTER TABLE "Screening"
  ADD COLUMN "administratorAuthenticatedByUserId" TEXT,
  ADD COLUMN "administratorAuthenticatedAt" TIMESTAMP(3);
