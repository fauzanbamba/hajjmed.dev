# Data, API and interoperability

## Core records

User, practitioner, organization/agent, pilgrim, appointment, screening, immunization, encounter, allergy, medication, clinical document, consent, notification, OTP challenge, refresh token and audit event are represented in Prisma.

## Identity and duplicate strategy

- Passport number is normalized and unique.
- Email, phone and professional licence constraints prevent duplicate accounts.
- Appointment idempotency keys prevent client retries from creating repeated bookings.
- Screening creation checks for an existing Hajj-cycle record.
- Immunization rejects the same pilgrim, vaccine, administration date and lot.
- Clinical document hashes identify duplicate uploaded content.

Production should add explicit Hajj-cycle/version fields where a rule is cycle-specific and database constraints wherever race conditions are possible.

## API conventions

- Base path: `/api/v1`
- JSON requests/responses
- Bearer JWT for protected routes
- Zod request validation
- Standard error object: code, message, request ID and optional details
- OpenAPI UI at `/docs` in development
- Sensitive mutations must be idempotent where retry is plausible

## Interoperability target

FHIR R4 profiles should be defined for Patient, Practitioner, Organization, Appointment, Encounter, Observation, Condition, AllergyIntolerance, MedicationRequest, Immunization, DiagnosticReport, DocumentReference, Consent and Provenance. This source does not claim conformance until profiles, capability statement and conformance tests are approved.

## Terminology

Use authoritative/licensed services for ICD-10, LOINC, SNOMED CT where licensed, medication concepts, units and vaccine codes. Do not deploy the short demonstration lists as complete terminology.

## Data quality

Mandatory fields, units, reference intervals, source, performer, date/time, status and provenance must be validated. Corrections retain previous value, author, reason and timestamp. Date/time should be stored in UTC and rendered with explicit operational timezone.

## Retention and disposal

Retention periods, legal holds, cross-border copies, subject-access exports and secure destruction require an approved retention schedule. They are policy decisions, not code defaults.
