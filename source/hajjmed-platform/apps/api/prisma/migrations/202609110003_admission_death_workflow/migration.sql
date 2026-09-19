ALTER TABLE "Encounter" ADD COLUMN "admissionHospital" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "admissionWard" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "treatmentFor" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "dailyUpdate" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "dailyUpdateDueAt" TIMESTAMP(3);
ALTER TABLE "Encounter" ADD COLUMN "deathSummary" TEXT;
ALTER TABLE "ClinicalDocument" ADD COLUMN "encounterId" TEXT;
CREATE INDEX "Encounter_dailyUpdateDueAt_disposition_idx" ON "Encounter"("dailyUpdateDueAt", "disposition");
CREATE INDEX "ClinicalDocument_encounterId_category_idx" ON "ClinicalDocument"("encounterId", "category");
