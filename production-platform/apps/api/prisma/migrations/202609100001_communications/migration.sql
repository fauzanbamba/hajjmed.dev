CREATE TYPE "CommunicationPriority" AS ENUM ('ROUTINE', 'URGENT');
CREATE TYPE "CommunicationStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

CREATE TABLE "CommunicationThread" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "pilgrimId" TEXT NOT NULL,
  "organizationId" TEXT,
  "openedByUserId" TEXT NOT NULL,
  "assignedToUserId" TEXT,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "priority" "CommunicationPriority" NOT NULL DEFAULT 'ROUTINE',
  "status" "CommunicationStatus" NOT NULL DEFAULT 'OPEN',
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationMessage" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunicationMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunicationThread_reference_key" ON "CommunicationThread"("reference");
CREATE INDEX "CommunicationThread_pilgrimId_updatedAt_idx" ON "CommunicationThread"("pilgrimId", "updatedAt");
CREATE INDEX "CommunicationThread_organizationId_status_updatedAt_idx" ON "CommunicationThread"("organizationId", "status", "updatedAt");
CREATE INDEX "CommunicationThread_assignedToUserId_status_updatedAt_idx" ON "CommunicationThread"("assignedToUserId", "status", "updatedAt");
CREATE INDEX "CommunicationMessage_threadId_createdAt_idx" ON "CommunicationMessage"("threadId", "createdAt");

ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommunicationThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
