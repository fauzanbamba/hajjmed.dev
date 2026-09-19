# HajjMed Ghana — Hajj 2027 EMR prototype

A self-contained, responsive Progressive Web App prototype for the Medical Directorate of the Pilgrims Affairs Office Ghana.

## Version 17 clinical-scope update

- Nurse screening access is limited to medical history, general examination and initial vital signs. Cardiovascular, respiratory, abdominal and CNS examinations, mobility, investigation orders, screening classification, clearance and authentication remain doctor-only.
- Doctor mobility choices are standardised as Independent, Independent with walking aid, Requires assistance, and Unable to ambulate.
- Pilgrims older than 60 receive a required Clinical Frailty Scale (CFS 1–9) assessment with baseline-function evidence. Proposed decision-support thresholds require clinical-governance approval before production use.
- Blood group is no longer displayed on the health summary or health card.
- Nursing medical-history responses, vital signs, general observations and frailty score are synchronised into the same pilgrim's doctor screening encounter, with nurse identity and timestamp retained for verification.
- Safety & tasks and Reports are excluded entirely from the Doctor and Nurse navigation; these oversight modules remain available only to authorised leadership roles.
- System settings and audit are restricted to the Administrator and Medical Director; all other roles are redirected if an old interface state attempts to open the restricted page.
- Accredited agents now have a dedicated enrolment form with agency selection, representative identity and contact verification. Doctor/Nurse profession selection maps automatically to the correct portal after Administrator or Medical Director approval in Backend → User & role management.
- The accredited-agent registration portal also captures business registration, operating region, office address and password setup, then issues an application reference and pending-verification receipt.
- Results & orders is organised into a referenced results register, investigation request section and dynamic structured result-entry/upload portal for doctors, nurses and authorised allied health scientists. Screening now includes structured urine dipstick and FBC templates, plus pregnancy testing for females aged 15–49.

## Run locally

From this folder, run any static web server, for example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`. You can also open `index.html` directly, although install/offline support requires a local server.

## Demo roles

Choose Clinician, Pilgrim, Accredited agent, or Administrator on the sign-in screen. The demo credentials are pre-filled; no real authentication or patient data is used.

## Prototype scope

- Role-scoped navigation and patient information
- Mandatory OTP verification at every pilgrim, clinician, Medical Director and administrator login, with SMS or email delivery choice
- Clinician self-registration with mandatory professional regulator, unique licence number, licence expiry and verification-pending status
- Mandatory clinician declaration of professional competence, documentation responsibility and personal accountability for negligence or practice outside scope
- Mandatory medical screening with positive-finding propagation
- Vaccination and certificate tracking
- Clinical summary, ICD-10 conditions, medications and longitudinal timeline
- Ghana and Saudi Arabia clinic operations
- Responsive mobile layout and installable PWA metadata
- International Patient Summary-style emergency health card with secure export affordance
- Structured results and orders with LOINC examples, care tasks and escalation
- Medication-safety and critical-result decision support
- Patient consent controls, record-access history and administrator audit log
- Offline/synchronisation status and FHIR-ready interoperability direction
- Full Hajj 2027 screening checklist: identification, 15-item medical history, vital-sign references, red-flag escalation, GREEN/AMBER/RED outcome and referral pathway
- Seven-vaccine workflow with batch/expiry capture, 30-minute observation, AEFI flagging and travel-health certificate issuance
- Rules-based automatic Hajj Medical Fitness Certificate generation for pilgrims with cleared screening and complete mandatory vaccinations
- Individual and batch printable pilgrim health cards containing medical history, allergy status, current medicines, vaccines and emergency alerts
- Generic Medical Director signature block for Dr. Abdul Samed Tanko on fitness certificates and pilgrim health cards
- Clinician workspace opens directly to patient care and does not expose the operational activity overview
- Separate Medical Director login for Dr. Abdul Samed Tanko with administrator-style executive dashboard
- Restricted backend console for users and roles, clinical rules, certificate engine, facilities, interoperability, backups, approvals and infrastructure status
- Administrator and Medical Director dashboards include direct privileged access to the backend console
- Appointment booking for screening and vaccination across all 16 Ghana administrative regions
- Dual SMS appointment confirmation to the pilgrim and accredited agent, including date, time, venue and purpose (screening, vaccination, combined service or review)
- Enforced daily regional screening caps: 100 for Greater Accra, Ashanti and Northern; 50 for every other region
- Separate protected allowance of 10 additional medical-screening places per region for walk-ins and VIPs
- Passport number as the primary pilgrim identity and a mandatory prerequisite for medical-screening bookings
- Duplicate prevention for pilgrim accounts using unique passport number, registered phone number and email address
- Duplicate appointment prevention for the same pilgrim, date and session
- Auditable override hierarchy: Medical Director over every role including Administrator; Administrator over clinicians, agents and pilgrims
- Passport-biodata account setup with duplicate-number checking, validity gating and region assignment
- Required pilgrim photograph using file upload or the smart device's front-facing camera capture interface
- Explicit manual passport-biodata entry for portal account creation; no passport document scan required
- Top-right pilgrim dashboard portrait using the uploaded/captured image with passport-verification status
- Required agency-pathway classification during pilgrim account creation: Accredited Agent, Protocol, Direct or Complementary
- Conditional accredited-agent selection when the Accredited Agent pathway is chosen
- Registration includes the 42 named accredited agencies from the supplied 2026 list; unverified reference codes and the unnamed blank row are excluded
- Additional registration pathways include Protocol / Free Tickets, Direct Hajj Pilgrims, Complementary and Staff
- Printable health cards use the pilgrim's passport photograph and omit blood-group information
- Unique scannable QR credential for every medically cleared pilgrim, shared across the health card, fitness certificate and vaccination documentation
- QR payload covers passport identity, approved medical/allergy/medication summary, vaccination status and fitness-certificate verification
- Strict read-only pilgrim health portal: only appointment booking permits pilgrim changes
- Clinics, acute-care operations, staff settings and programme queues are removed from pilgrim navigation; Consent & Access remains visible and read-only
- Accredited-agent access is limited to the agent's assigned pilgrims and appointment booking; assigned health information is read-only
- Programme overviews, clinic operations, acute-care workflows, vaccination activity dashboards, staff settings and consent/audit records are removed from accredited-agent navigation
- Accredited agents can view each assigned pilgrim's final screening outcome and approved acute-care encounter summaries without editing access
- Structured cardiovascular, respiratory, abdominal and CNS examinations with NYHA class, mMRC breathlessness grade and Glasgow Coma Scale components
- Automatic examination abnormality summary feeding the screening clinical-alert workflow
- Structured FBC, renal/electrolyte, liver and clinically indicated hormonal-profile results
- CXR order/report workflow, 12-lead ECG measurements and transthoracic echocardiogram reporting
- Investigation policy requiring clinical indication for imaging, hormonal studies and advanced cardiac testing
- Multi-file laboratory and imaging result uploads with investigation category, study date, source facility and clinical interpretation
- PDF, JPEG, PNG, WebP and DICOM intake with 25 MB per-file validation, review status and secure-viewer affordance

This is a UX prototype, not a production clinical system. Production deployment requires a secure backend, audited authorization, encryption, consent and retention controls, clinical validation, interoperability, and Ghana/Saudi regulatory review.
