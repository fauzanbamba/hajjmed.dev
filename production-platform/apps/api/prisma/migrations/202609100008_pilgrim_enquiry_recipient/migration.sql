ALTER TABLE "CommunicationThread" ADD COLUMN "recipientGroup" TEXT;

ALTER TABLE "CommunicationThread"
ADD CONSTRAINT "CommunicationThread_pilgrim_recipient_group_check"
CHECK ("recipientGroup" IS NULL OR "recipientGroup" IN ('AGENT', 'MEDICAL_TEAM'));
