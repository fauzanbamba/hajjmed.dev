ALTER TABLE "Screening" ADD COLUMN "regulatoryHardRed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Screening" ADD COLUMN "regulatoryExclusionCodes" JSONB;
ALTER TABLE "Screening" ADD COLUMN "regulatorySourceVersion" TEXT;
ALTER TABLE "Screening" ADD COLUMN "regulatoryLockedAt" TIMESTAMP(3);
CREATE INDEX "Screening_regulatoryHardRed_idx" ON "Screening"("regulatoryHardRed");
