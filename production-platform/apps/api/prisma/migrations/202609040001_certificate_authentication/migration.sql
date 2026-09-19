ALTER TABLE "Screening"
ADD COLUMN "authenticatedByUserId" TEXT,
ADD COLUMN "authenticatedAt" TIMESTAMP(3);

CREATE INDEX "Screening_authenticatedAt_idx" ON "Screening"("authenticatedAt");
