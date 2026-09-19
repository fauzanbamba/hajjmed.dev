# AMBER Screening Outcome: Results, Orders and Subsequent Review SOP

**Status:** Demonstration specification. The Medical Directorate must clinically validate and approve this SOP before production use.

## Purpose

Ensure that an AMBER Hajj medical-screening outcome leads to documented investigation, an authorised subsequent-review appointment and a final accountable decision without creating a duplicate screening record.

## Workflow

1. **Record the AMBER decision.** The screening doctor records the positive findings, decision rationale, risk, care plan, responsible team and required timeframe. The original screening becomes the authoritative record.
2. **Notify the pilgrim and accredited agent.** Send SMS, email where registered, and portal notifications stating that further review is required and that AMBER is not final travel clearance.
3. **Open Results & Orders automatically.** The system redirects the clinician to the same pilgrim's Results & Orders workspace. It must not open a second screening encounter.
4. **Order indicated investigations.** Record each requested test, clinical indication, priority, requesting clinician, performing facility and date. Critical or urgent requests must enter the escalation queue.
5. **Perform and report investigations.** Authorised diagnostic personnel enter structured results, units, performing-laboratory reference intervals, flags, source report and authorised interpretation. Entries become read-only after 24 hours except for audited leadership amendment.
6. **Review results.** The responsible doctor acknowledges abnormal and critical results, records clinical interpretation and updates the pilgrim's care plan. Critical results require immediate clinical escalation and must not wait for the scheduled appointment.
7. **Book subsequent clinical review.** Create a `review` appointment, not another `screening` appointment. Record reference, venue, date and two-hour session. The appointment must follow the applicable notice and capacity rules. Notify the pilgrim and agent when booked, changed or cancelled.
8. **Enforce the review gate.** Without a confirmed review appointment, clinicians cannot enter the review interface. At the appointment, verify passport identity and show the original screening and available results read-only before capturing new review findings.
9. **Complete the review.** Record interval history, treatment adherence, focused examination, investigations reviewed, updated care plan, rationale and one outcome: GREEN, continued AMBER or RED.
10. **Close the loop.** GREEN proceeds to remaining vaccine/document checks and Medical Director authentication. Continued AMBER requires further optimisation and, if clinically indicated, another authorised review. RED requires senior or multidisciplinary assessment. Notifications and audit events are generated for every transition.

## Role controls

- **Doctor:** screening decision, orders, clinical interpretation, review and updated outcome.
- **Nurse:** medical history, initial observations and authorised preparation within nursing scope.
- **Allied health professional:** Results & Orders only, within verified discipline and licence.
- **Administrator:** operational oversight and audited administrative override.
- **Medical Director:** highest clinical authority, authentication and audited outcome override.
- **Pilgrim and accredited agent:** approved outcome, care plan, appointment and notification information only; clinical working notes remain restricted.

## Non-bypass controls

- A subsequent review continues the original screening record; it never creates a duplicate initial screening.
- A confirmed `review` appointment is mandatory for review entry, except for an explicitly audited Administrator or Medical Director override.
- Original screening and diagnostic entries lock after 24 hours for ordinary users.
- Every access denial, override, result amendment, notification and outcome transition is auditable.
- Certificate eligibility starts only after completion of all required clinical and vaccination conditions and the configured authentication workflow.

## Demonstration case

The demo uses Amina Sulemana (`GH27-004821`) to show an AMBER screening, RFT and ECG orders, available results and confirmed review appointment `REV-270122-004821` at Hajj Village Accra on 22 January 2027 from 10:00–12:00. The review remains the next step and uses the existing screening record.
