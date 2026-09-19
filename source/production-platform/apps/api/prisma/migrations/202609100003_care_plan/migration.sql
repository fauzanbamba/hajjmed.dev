CREATE TABLE "CarePlan" (
  "id" TEXT NOT NULL,
  "pilgrimId" TEXT NOT NULL,
  "selections" JSONB NOT NULL,
  "responsibleTeam" TEXT NOT NULL,
  "reviewDate" TIMESTAMP(3),
  "clinicalRationale" TEXT NOT NULL,
  "sharedSummary" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdByUserId" TEXT NOT NULL,
  "updatedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CarePlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CarePlan_pilgrimId_key" ON "CarePlan"("pilgrimId");
CREATE INDEX "CarePlan_status_reviewDate_idx" ON "CarePlan"("status", "reviewDate");
ALTER TABLE "CarePlan" ADD CONSTRAINT "CarePlan_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
