ALTER TABLE "Pilgrim" ADD COLUMN "homeRegion" TEXT;
ALTER TABLE "Facility" ADD COLUMN "location" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "manualDiagnosis" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "referralPlace" TEXT;
CREATE INDEX "Encounter_disposition_startedAt_idx" ON "Encounter"("disposition", "startedAt");
