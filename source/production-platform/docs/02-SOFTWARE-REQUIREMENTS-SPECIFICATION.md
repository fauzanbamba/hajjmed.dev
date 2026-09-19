# Software requirements specification

## Intended use

The system records and coordinates Hajj 2027 registration, regional screening/vaccination appointments, medical screening, immunization, investigations, clinic and emergency encounters, approved health summaries and controlled medical fitness certificates.

## Functional requirements

### Identity and registration

- A pilgrim has one master record and one portal account.
- Passport number is the primary identity and is unique after normalization.
- Registration captures passport biodata, photograph, phone, email, region and agency pathway.
- Non-accredited pathways capture emergency-contact name, phone and relationship.
- Clinician enrolment captures profession, regulator, licence, expiry and accountability attestation.
- Authentication uses password plus OTP by registered SMS or email.

### Access control

- Pilgrims see only their record and can change only permitted consent/access choices and appointments.
- Agents see read-only approved information for only their assigned pilgrims and may manage permitted bookings.
- Nurses document screening history, vaccination and nursing care; they do not perform physician-only examination/clearance.
- Doctors conduct examinations, diagnosis, prescriptions and clearance.
- Administrators manage operations/backend and override lower roles.
- Medical Director outranks administrators and exclusively authenticates fitness certificates.

### Appointments

- No initial booking without a valid passport.
- One initial appointment per pilgrim; subsequent review requires documented clinical decision.
- Standard daily capacity is 50 per region, except Greater Accra, Ashanti and Northern at 100.
- Ten protected walk-in/VIP places per region are visible only to administrators and Medical Director.
- Sessions are 08:00–10:00, 10:00–12:00, 12:00–14:00 and 14:00–16:00.
- Booking/amendment requires at least 24 hours; changes are locked inside 24 hours.
- Pilgrim is region-restricted; agent may inspect standard availability across regions.
- Confirmation, amendment and cancellation queue SMS and email notices.

### Screening

- Confirmed matching appointment is required.
- One Hajj 2027 master screening record per pilgrim; later reviews update/supersede it.
- History, vital signs, cardiovascular, respiratory, abdominal, CNS, mobility, vision/hearing and approved checklist data are captured.
- Abnormal findings are highlighted and propagated to the longitudinal record.
- Rules propose GREEN, AMBER or RED; clinician confirms and documents rationale.
- Investigations are optional and require an indication when ordered.

### Vaccination

- Confirmed matching appointment is required.
- Vaccine, date, lot, expiry, dose, route/site, contraindication check, observation and AEFI notes are recorded.
- Exact duplicate pilgrim/vaccine/date/lot administrations are rejected while legitimate additional doses remain possible.

### Encounters

- Clinic and acute/emergency encounters show passport photo and approved emergency summary.
- Triage aggregates observations and red flags to a priority, subject to clinician confirmation.
- Previous encounters are displayed before a subsequent encounter.
- ICD-10 and medication search require licensed/current production terminology services.

### Credentials

- Health cards can be generated independently and include photo, history, allergies, medicines and immunization summary.
- Medical fitness certificate requires completed GREEN screening, completed mandatory vaccination and Medical Director authentication.
- Certificate is available only to the pilgrim, nurse, doctor, administrator and Medical Director after authentication.
- Agent certificate access is prohibited; agents retain assigned-pilgrim health-card access.
- QR credentials disclose only approved content and require secure server-side verification in production.

## Non-functional requirements

- Availability target and RTO/RPO must be approved before procurement.
- TLS in transit; managed encryption at rest; secrets outside source control.
- Complete, tamper-evident audit of sensitive reads, writes, exports and overrides.
- Responsive operation on current mobile/desktop browsers and supported Android/iOS versions.
- Accessibility target: WCAG 2.2 AA.
- Ghana/Saudi low-connectivity workflows must fail safely with controlled reconciliation.
- Performance and concurrency targets must be load-tested against forecast pilgrim volume and surge.

## Out of scope for autonomous operation

The software does not independently diagnose, prescribe, determine final triage, authenticate identity, or declare fitness without an accountable authorized professional.
