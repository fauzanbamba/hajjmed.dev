ALTER TABLE "CommunicationMessage"
ADD COLUMN "shareWithAgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "agentSafeBody" TEXT;
