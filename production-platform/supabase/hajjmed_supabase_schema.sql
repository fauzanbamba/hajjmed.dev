-- HajjMed Supabase database schema
-- Generated from the project's Prisma schema and ordered migrations.
-- Target: Supabase PostgreSQL
-- IMPORTANT: This database contains sensitive health data. Keep the service-role key server-side only.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PILGRIM', 'AGENT', 'CLINICIAN', 'NURSE', 'ALLIED_HEALTH', 'PHARMACIST', 'ADMIN', 'MEDICAL_DIRECTOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AppointmentPurpose" AS ENUM ('SCREENING', 'VACCINATION', 'SCREENING_AND_VACCINATION', 'REVIEW');

-- CreateEnum
CREATE TYPE "BookingCategory" AS ENUM ('SCHEDULED', 'WALK_IN', 'VIP');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ScreeningOutcome" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateEnum
CREATE TYPE "EncounterType" AS ENUM ('CLINIC', 'ACUTE_CARE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "EncounterStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_FAILED', 'OTP_SENT', 'OTP_VERIFIED', 'OVERRIDE', 'EXPORT', 'BREAK_GLASS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accredited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phoneNormalized" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "displayName" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practitioner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "regulator" TEXT NOT NULL,
    "licenseNumberNormalized" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "identityStatus" "IdentityStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practitioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilgrim" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "passportNumberNormalized" TEXT NOT NULL,
    "passportExpiry" TIMESTAMP(3) NOT NULL,
    "surname" TEXT NOT NULL,
    "givenNames" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Ghanaian',
    "region" TEXT NOT NULL,
    "photoObjectKey" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pilgrim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "purpose" "AppointmentPurpose" NOT NULL,
    "category" "BookingCategory" NOT NULL DEFAULT 'SCHEDULED',
    "status" "AppointmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "region" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "bookedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Screening" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "questionnaireVersion" TEXT NOT NULL,
    "outcome" "ScreeningOutcome" NOT NULL,
    "positiveFindings" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "recommendations" TEXT,
    "performedByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ruleSetVersion" TEXT NOT NULL,
    "supersedesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "type" "EncounterType" NOT NULL,
    "status" "EncounterStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "chiefComplaint" TEXT,
    "diagnosisCodes" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "interventions" JSONB NOT NULL,
    "disposition" TEXT,
    "clinicianUserId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "codeSystem" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT,
    "status" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "codeSystem" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "prescribedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Immunization" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "vaccineCode" TEXT NOT NULL,
    "vaccineDisplay" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "administeredAt" TIMESTAMP(3) NOT NULL,
    "facilityId" TEXT NOT NULL,
    "performerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Immunization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalDocument" (
    "id" TEXT NOT NULL,
    "pilgrimId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "studyDate" TIMESTAMP(3),
    "sourceFacility" TEXT,
    "interpretation" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "destinationMasked" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "Role",
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT,
    "patientId" TEXT,
    "reason" TEXT,
    "metadata" JSONB NOT NULL,
    "ipAddress" TEXT,
    "requestId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousHash" TEXT,
    "eventHash" TEXT NOT NULL,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalDailyCapacity" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "scheduledScreening" INTEGER NOT NULL DEFAULT 0,
    "vaccination" INTEGER NOT NULL DEFAULT 0,
    "specialScreening" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RegionalDailyCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "recipientType" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "channel" "OtpChannel" NOT NULL,
    "template" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "providerReference" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_type_key" ON "Organization"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNormalized_key" ON "User"("phoneNormalized");

-- CreateIndex
CREATE INDEX "User_organizationId_role_idx" ON "User"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_userId_key" ON "Practitioner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Practitioner_licenseNumberNormalized_key" ON "Practitioner"("licenseNumberNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Pilgrim_userId_key" ON "Pilgrim"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pilgrim_passportNumberNormalized_key" ON "Pilgrim"("passportNumberNormalized");

-- CreateIndex
CREATE INDEX "Pilgrim_organizationId_idx" ON "Pilgrim"("organizationId");

-- CreateIndex
CREATE INDEX "Pilgrim_surname_givenNames_idx" ON "Pilgrim"("surname", "givenNames");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_idempotencyKey_key" ON "Appointment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Appointment_region_startsAt_purpose_status_idx" ON "Appointment"("region", "startsAt", "purpose", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_pilgrimId_startsAt_key" ON "Appointment"("pilgrimId", "startsAt");

-- CreateIndex
CREATE INDEX "Screening_pilgrimId_performedAt_idx" ON "Screening"("pilgrimId", "performedAt");

-- CreateIndex
CREATE INDEX "Encounter_pilgrimId_startedAt_idx" ON "Encounter"("pilgrimId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Immunization_pilgrimId_vaccineCode_administeredAt_key" ON "Immunization"("pilgrimId", "vaccineCode", "administeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalDocument_objectKey_key" ON "ClinicalDocument"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalDocument_sha256_key" ON "ClinicalDocument"("sha256");

-- CreateIndex
CREATE INDEX "OtpChallenge_userId_createdAt_idx" ON "OtpChallenge"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuditEvent_eventHash_key" ON "AuditEvent"("eventHash");

-- CreateIndex
CREATE INDEX "AuditEvent_patientId_occurredAt_idx" ON "AuditEvent"("patientId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_occurredAt_idx" ON "AuditEvent"("actorUserId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalDailyCapacity_region_date_key" ON "RegionalDailyCapacity"("region", "date");

-- CreateIndex
CREATE INDEX "Notification_status_createdAt_idx" ON "Notification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_appointmentId_idx" ON "Notification"("appointmentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practitioner" ADD CONSTRAINT "Practitioner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilgrim" ADD CONSTRAINT "Pilgrim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilgrim" ADD CONSTRAINT "Pilgrim_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Screening" ADD CONSTRAINT "Screening_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalDocument" ADD CONSTRAINT "ClinicalDocument_pilgrimId_fkey" FOREIGN KEY ("pilgrimId") REFERENCES "Pilgrim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpChallenge" ADD CONSTRAINT "OtpChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ============================================================
-- Project schema evolution
-- ============================================================

-- 202609030001_appointment_policy/migration.sql
ALTER TABLE "Appointment"
ADD COLUMN "screeningId" TEXT,
ADD COLUMN "clinicalDecision" TEXT,
ADD COLUMN "authorizedByUserId" TEXT;


-- 202609040001_certificate_authentication/migration.sql
ALTER TABLE "Screening"
ADD COLUMN "authenticatedByUserId" TEXT,
ADD COLUMN "authenticatedAt" TIMESTAMP(3);

CREATE INDEX "Screening_authenticatedAt_idx" ON "Screening"("authenticatedAt");


-- 202609100001_communications/migration.sql
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


-- 202609100002_optional_passport_dates/migration.sql
ALTER TABLE "Pilgrim" ALTER COLUMN "passportExpiry" DROP NOT NULL;


-- 202609100003_care_plan/migration.sql
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


-- 202609100003_dual_fitness_authentication/migration.sql
ALTER TABLE "Screening"
  ADD COLUMN "administratorAuthenticatedByUserId" TEXT,
  ADD COLUMN "administratorAuthenticatedAt" TIMESTAMP(3);


-- 202609100004_professional_email/migration.sql
ALTER TABLE "User" ADD COLUMN "professionalEmail" TEXT;
CREATE UNIQUE INDEX "User_professionalEmail_key" ON "User"("professionalEmail");


-- 202609100005_pharmacy_inventory/migration.sql
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PHARMACIST';
CREATE TYPE "RequisitionStatus" AS ENUM ('PENDING','PART_SUPPLIED','SUPPLIED','CANCELLED');
CREATE TABLE "InventoryItem" ("id" TEXT NOT NULL,"code" TEXT NOT NULL,"genericName" TEXT NOT NULL,"formulation" TEXT NOT NULL,"strength" TEXT NOT NULL,"unit" TEXT NOT NULL,"quantity" INTEGER NOT NULL DEFAULT 0,"reorderLevel" INTEGER NOT NULL DEFAULT 0,"location" TEXT NOT NULL DEFAULT 'CENTRAL_STORE',"active" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "InventoryItem_code_key" ON "InventoryItem"("code");
CREATE INDEX "InventoryItem_genericName_formulation_strength_idx" ON "InventoryItem"("genericName","formulation","strength");
CREATE INDEX "InventoryItem_location_active_idx" ON "InventoryItem"("location","active");
CREATE TABLE "Requisition" ("id" TEXT NOT NULL,"reference" TEXT NOT NULL,"clinicName" TEXT NOT NULL,"period" TEXT NOT NULL,"justification" TEXT NOT NULL,"status" "RequisitionStatus" NOT NULL DEFAULT 'PENDING',"requestedByUserId" TEXT NOT NULL,"suppliedByUserId" TEXT,"suppliedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Requisition_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Requisition_reference_key" ON "Requisition"("reference");
CREATE TABLE "RequisitionItem" ("id" TEXT NOT NULL,"requisitionId" TEXT NOT NULL,"inventoryItemId" TEXT NOT NULL,"requestedQuantity" INTEGER NOT NULL,"suppliedQuantity" INTEGER NOT NULL DEFAULT 0,CONSTRAINT "RequisitionItem_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "RequisitionItem_requisitionId_inventoryItemId_key" ON "RequisitionItem"("requisitionId","inventoryItemId");
ALTER TABLE "RequisitionItem" ADD CONSTRAINT "RequisitionItem_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "Requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequisitionItem" ADD CONSTRAINT "RequisitionItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 202609100006_clinician_dispensing/migration.sql
CREATE TABLE "MedicationDispense" ("id" TEXT NOT NULL,"idempotencyKey" TEXT NOT NULL,"prescriptionReference" TEXT NOT NULL,"pilgrimId" TEXT NOT NULL,"inventoryItemId" TEXT NOT NULL,"quantity" INTEGER NOT NULL,"dispensedByUserId" TEXT NOT NULL,"dispensedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "MedicationDispense_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "MedicationDispense_idempotencyKey_key" ON "MedicationDispense"("idempotencyKey");
CREATE INDEX "MedicationDispense_pilgrimId_dispensedAt_idx" ON "MedicationDispense"("pilgrimId","dispensedAt");
CREATE INDEX "MedicationDispense_prescriptionReference_idx" ON "MedicationDispense"("prescriptionReference");
ALTER TABLE "MedicationDispense" ADD CONSTRAINT "MedicationDispense_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 202609100007_direct_messaging/migration.sql
ALTER TABLE "CommunicationThread" ADD COLUMN "directRecipientUserId" TEXT;
CREATE INDEX "CommunicationThread_directRecipientUserId_updatedAt_idx" ON "CommunicationThread"("directRecipientUserId","updatedAt");
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_directRecipientUserId_fkey" FOREIGN KEY ("directRecipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- 202609100008_pilgrim_enquiry_recipient/migration.sql
ALTER TABLE "CommunicationThread" ADD COLUMN "recipientGroup" TEXT;

ALTER TABLE "CommunicationThread"
ADD CONSTRAINT "CommunicationThread_pilgrim_recipient_group_check"
CHECK ("recipientGroup" IS NULL OR "recipientGroup" IN ('AGENT', 'MEDICAL_TEAM'));


-- 202609100009_trusted_devices/migration.sql
CREATE TABLE "TrustedDevice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userAgentHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TrustedDevice_tokenHash_key" ON "TrustedDevice"("tokenHash");
CREATE INDEX "TrustedDevice_userId_expiresAt_idx" ON "TrustedDevice"("userId", "expiresAt");
ALTER TABLE "TrustedDevice" ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 202609100010_regulatory_hard_red/migration.sql
ALTER TABLE "Screening" ADD COLUMN "regulatoryHardRed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Screening" ADD COLUMN "regulatoryExclusionCodes" JSONB;
ALTER TABLE "Screening" ADD COLUMN "regulatorySourceVersion" TEXT;
ALTER TABLE "Screening" ADD COLUMN "regulatoryLockedAt" TIMESTAMP(3);
CREATE INDEX "Screening_regulatoryHardRed_idx" ON "Screening"("regulatoryHardRed");


-- 202609100011_regulatory_history_evidence/migration.sql
ALTER TABLE "Screening" ADD COLUMN "regulatoryExclusionEvidence" JSONB;


-- 202609110001_agent_safe_messages/migration.sql
ALTER TABLE "CommunicationMessage"
ADD COLUMN "shareWithAgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "agentSafeBody" TEXT;


-- 202609110002_structured_regions_disposition/migration.sql
ALTER TABLE "Pilgrim" ADD COLUMN "homeRegion" TEXT;
ALTER TABLE "Facility" ADD COLUMN "location" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "manualDiagnosis" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "referralPlace" TEXT;
CREATE INDEX "Encounter_disposition_startedAt_idx" ON "Encounter"("disposition", "startedAt");


-- 202609110003_admission_death_workflow/migration.sql
ALTER TABLE "Encounter" ADD COLUMN "admissionHospital" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "admissionWard" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "treatmentFor" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "dailyUpdate" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "dailyUpdateDueAt" TIMESTAMP(3);
ALTER TABLE "Encounter" ADD COLUMN "deathSummary" TEXT;
ALTER TABLE "ClinicalDocument" ADD COLUMN "encounterId" TEXT;
CREATE INDEX "Encounter_dailyUpdateDueAt_disposition_idx" ON "Encounter"("dailyUpdateDueAt", "disposition");
CREATE INDEX "ClinicalDocument_encounterId_category_idx" ON "ClinicalDocument"("encounterId", "category");


-- 202609110004_correct_disposition_details/migration.sql
ALTER TABLE "Encounter" ADD COLUMN "placeOfDeath" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "timeOfDeath" TIMESTAMP(3);


-- 202609180001_screening_finding_rows/migration.sql
CREATE TABLE "ScreeningFinding" (
    "id" TEXT NOT NULL,
    "screeningId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "severity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningFinding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScreeningFinding_screeningId_code_key" ON "ScreeningFinding"("screeningId", "code");
CREATE INDEX "ScreeningFinding_code_idx" ON "ScreeningFinding"("code");

ALTER TABLE "ScreeningFinding"
ADD CONSTRAINT "ScreeningFinding_screeningId_fkey"
FOREIGN KEY ("screeningId") REFERENCES "Screening"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Prisma relation added by the current source schema.
ALTER TABLE "ClinicalDocument"
  ADD CONSTRAINT "ClinicalDocument_encounterId_fkey"
  FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Supabase usability hardening
-- ============================================================

-- Database-side UUID defaults for direct Supabase inserts.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'Organization','User','Practitioner','Pilgrim','CarePlan',
    'CommunicationThread','CommunicationMessage','Facility','Appointment',
    'Screening','ScreeningFinding','Encounter','Allergy','Medication',
    'Immunization','ClinicalDocument','OtpChallenge','TrustedDevice',
    'Session','AuditEvent','RegionalDailyCapacity','Notification',
    'InventoryItem','MedicationDispense','Requisition','RequisitionItem'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text',
      t
    );
  END LOOP;
END $$;

-- Keep updatedAt correct when rows are changed outside Prisma.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'Organization','User','Practitioner','Pilgrim','CarePlan',
    'CommunicationThread','Appointment','Encounter',
    'InventoryItem','Requisition'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 'set_updated_at_' || t, t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      'set_updated_at_' || t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- Row Level Security
-- ============================================================
-- The HajjMed API uses the Supabase service-role key on the server.
-- Service-role access bypasses RLS. No public/authenticated client
-- policies are created here because the project's custom Fastify
-- authentication/authorization layer is the access-control boundary.
--
-- This intentionally makes direct PostgREST access fail closed until
-- explicit policies are designed around the application's auth model.

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'Organization','User','Practitioner','Pilgrim','CarePlan',
    'CommunicationThread','CommunicationMessage','Facility','Appointment',
    'Screening','ScreeningFinding','Encounter','Allergy','Medication',
    'Immunization','ClinicalDocument','OtpChallenge','TrustedDevice',
    'Session','AuditEvent','RegionalDailyCapacity','Notification',
    'InventoryItem','MedicationDispense','Requisition','RequisitionItem'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

COMMENT ON SCHEMA public IS
'HajjMed clinical platform schema. Sensitive health data. Server-side service role only unless explicit RLS policies are added.';
