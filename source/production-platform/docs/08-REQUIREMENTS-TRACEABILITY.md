# Requirements traceability matrix

| ID | Requirement | Implementation evidence | Verification status |
|---|---|---|---|
| ID-01 | Unique passport-first pilgrim registration | Prisma unique fields; `pilgrims.ts`; unified prototype form | Foundation tested by type checks; concurrency test required |
| IAM-01 | Password plus SMS/email OTP | `auth.ts`, Redis OTP model, mobile OTP screen | Integration/provider test required |
| RBAC-01 | Patient/agency role scoping | `authz.ts`, route guards | Unit tests present; full matrix required |
| APT-01 | Regional capacities/protected places | `appointment-policy.ts`, `appointments.ts` | Unit tests present; load/concurrency test required |
| APT-02 | One initial appointment and 24-hour lock | `appointments.ts`, web policy workflow | Automated edge tests required |
| SCR-01 | Confirmed appointment before screening | web appointment gate; API linkage foundation | API enforcement expansion required |
| SCR-02 | Structured history/examination/risk | web screening modules | Clinical validation required |
| SCR-03 | One master screening record | `clinical.ts`, web duplicate guard | Database cycle constraint required |
| INV-01 | Optional investigation order | web screening order interface | API/order model planned |
| VAX-01 | Vaccination traceability/duplicate block | Immunization model, `clinical.ts`, web workflow | Integration tests required |
| ENC-01 | Clinic/emergency record and prior history | web encounter modules; API encounter route | End-to-end tests required |
| DOC-01 | Health card with passport photograph | web print template | Rendering/security tests required |
| CERT-01 | Medical Director-authenticated certificate | screening authentication fields/migration, `admin.ts`, web queue | API integration/E2E test required |
| NOT-01 | SMS/email lifecycle notices | notification outbox service; web previews | Provider delivery/retry worker required |
| AUD-01 | Tamper-evident audit | `audit.ts` | Integrity and archive tests required |
| MOB-01 | Mobile portal foundation | `apps/mobile` | Device/E2E/offline tests required |
| INT-01 | FHIR/terminology services | architecture specification only | Planned |

This matrix must be expanded into test-case-level traceability before pilot.
