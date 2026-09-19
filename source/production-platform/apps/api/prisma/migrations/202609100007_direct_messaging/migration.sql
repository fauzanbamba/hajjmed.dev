ALTER TABLE "CommunicationThread" ADD COLUMN "directRecipientUserId" TEXT;
CREATE INDEX "CommunicationThread_directRecipientUserId_updatedAt_idx" ON "CommunicationThread"("directRecipientUserId","updatedAt");
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_directRecipientUserId_fkey" FOREIGN KEY ("directRecipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
