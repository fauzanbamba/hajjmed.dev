# Security, privacy and clinical safety

## Implemented foundations

- Argon2 password hashing
- OTP challenge support
- JWT authentication and refresh-token model
- Role hierarchy and patient/agency scoping
- Rate limiting, security headers and CORS restriction
- Request validation and redacted logging
- Hash-chained audit events
- Unique identity constraints and appointment idempotency
- Medical Director-only certificate authentication

## Required production controls

- Certified/assured identity proofing, MFA recovery and joiner/mover/leaver processes
- Hardware-backed secret/key management and rotation
- TLS termination, WAF, DDoS protection and private database networking
- Endpoint/device management, remote wipe and minimum OS versions
- Encryption at rest with documented key ownership
- Central monitoring, SIEM alerts and immutable audit retention
- Secure software supply chain, dependency scanning, SAST/DAST and signed builds
- Independent penetration test and remediation verification
- Vendor due diligence and data-processing agreements
- Tested incident/breach response and regulator notification process

## Privacy

Complete a DPIA before pilot. Establish lawful basis for screening, care, public-health functions, agency disclosure, cross-border processing and emergency access. Apply minimization: agents receive only approved information for assigned pilgrims; QR codes should carry an opaque identifier, expiry and signature rather than unrestricted health data.

## Clinical hazards requiring controlled mitigation

| Hazard | Principal control |
|---|---|
| Wrong-patient documentation | Passport-first identity, photograph on clinical screens, two identifiers before save |
| Duplicate record/dose | Unique constraints, idempotency and duplicate checks |
| Unsafe automated classification | Validated versioned rules plus clinician confirmation |
| Missed abnormal result | Highlight, task/escalation, acknowledgement and closed-loop review |
| Incorrect certificate | Clinical prerequisites plus Medical Director authentication and audit |
| Stale offline record | Visible sync state, conflict policy and reconciliation queue |
| Inappropriate agent disclosure | Agency-scoped read-only authorization and audit |
| Unauthorized override | Role hierarchy, reason, alert and retrospective review |

## Security release gate

No real health data until threat model, DPIA, access matrix, penetration test, dependency review, backup/restore proof, incident exercise and residual-risk acceptance are signed.
