CREATE TABLE "MedicationDispense" ("id" TEXT NOT NULL,"idempotencyKey" TEXT NOT NULL,"prescriptionReference" TEXT NOT NULL,"pilgrimId" TEXT NOT NULL,"inventoryItemId" TEXT NOT NULL,"quantity" INTEGER NOT NULL,"dispensedByUserId" TEXT NOT NULL,"dispensedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "MedicationDispense_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "MedicationDispense_idempotencyKey_key" ON "MedicationDispense"("idempotencyKey");
CREATE INDEX "MedicationDispense_pilgrimId_dispensedAt_idx" ON "MedicationDispense"("pilgrimId","dispensedAt");
CREATE INDEX "MedicationDispense_prescriptionReference_idx" ON "MedicationDispense"("prescriptionReference");
ALTER TABLE "MedicationDispense" ADD CONSTRAINT "MedicationDispense_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
