# Test, validation and release plan

## Test levels

1. Unit tests: policy calculations, validation, normalization, role hierarchy and rule functions.
2. Integration tests: API/database transactions, unique constraints, notification outbox and audit chain.
3. Contract tests: web/mobile clients against OpenAPI and shared contracts.
4. End-to-end tests: registration through booking, screening, vaccination, authentication and document access.
5. Clinical validation: approved scenarios, boundary values, adverse cases and human-factors review.
6. Security testing: SAST, dependency analysis, DAST, penetration test and authorization matrix.
7. Performance/resilience: regional booking surge, clinic concurrency, provider failures, offline/reconnect and recovery.
8. Accessibility/device testing: WCAG 2.2 AA, supported browsers, screen sizes and assistive technologies.

## Critical acceptance scenarios

- Duplicate passport/account blocked under concurrency.
- Pilgrim and agent cannot access another pilgrim.
- Nurse cannot enter physician-only examination/clearance.
- Administrator cannot override Medical Director.
- Appointment capacity cannot be exceeded under concurrent requests.
- Protected slots are invisible and unavailable to unauthorized roles.
- No screening/vaccination opens without matching confirmed appointment.
- Exact duplicate screening or vaccine administration is rejected.
- Abnormal findings appear in longitudinal context.
- Certificate is unavailable before Medical Director authentication and immediately available to authorized roles afterward.
- Agent never receives certificate access.
- Every sensitive read/write/export/override produces a valid audit event.

## Clinical-rule validation

For every rule record: owner, evidence source, version, inputs/units, exclusions, thresholds, expected output, test cases, approval date and review date. Validate boundary values and missing/contradictory data. GREEN/AMBER/RED and triage are decision support only unless governance explicitly approves otherwise.

## Release evidence

- Approved SRS and traceability matrix
- Test report with pass/fail and defect disposition
- Clinical validation report
- Penetration-test report and remediation retest
- DPIA and regulatory assessment
- Backup restore and disaster-recovery evidence
- Training and support readiness
- Pilot report and residual-risk acceptance
- Signed release authorization

## Current automated checks

Use `pnpm lint`, `pnpm build` and `pnpm test`. Current tests cover shared contracts, authorization and appointment policy. Coverage is not yet sufficient for production; expand it according to the scenarios above.
