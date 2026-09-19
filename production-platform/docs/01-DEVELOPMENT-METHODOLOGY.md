# Development methodology and lifecycle

## Method selected

HajjMed uses an iterative Agile delivery model with clinical-safety and regulatory stage gates. Two-week engineering iterations are recommended, while governance, privacy, security and clinical-validation decisions are controlled documents requiring named approval. This hybrid approach permits rapid user feedback without treating a clinical system like an ordinary consumer application.

## Lifecycle

### 1. Discovery and governance

Activities: stakeholder mapping, workflow observation, ownership definition, data-controller determination, DPIA initiation, Ghana/Saudi regulatory matrix, clinical safety plan and procurement constraints.

Outputs: project charter, RACI, intended-use statement, risk register, DPIA, procurement plan and initial backlog.

Exit gate: accountable executive, clinical safety officer and data-protection roles formally appointed.

### 2. Requirements and clinical specification

Activities: user stories, process maps, role matrix, data dictionary, appointment policy, screening checklist, vaccination policy, triage rules, certificate conditions and downtime requirements.

Outputs: approved SRS, traceability matrix, versioned clinical-rule specification and acceptance criteria.

Exit gate: clinical and product owners approve requirements and unresolved hazards are assigned.

### 3. Architecture and design

Activities: threat modelling, data model, API contracts, identity model, audit design, FHIR profiling, terminology catalogue, offline strategy and recovery architecture.

Outputs: architecture decision records, schema, interface specifications, prototypes and test strategy.

Exit gate: security, privacy, clinical and operational design review.

### 4. Iterative implementation

Each sprint contains backlog refinement, design, implementation, peer review, automated tests, demonstration and retrospective. A feature is done only when code, tests, documentation, authorization behaviour, error handling and audit events are addressed.

### 5. Verification and clinical validation

Engineering verification asks whether the software was built according to specification. Clinical validation asks whether the specified workflows and rules are safe and appropriate for intended use. These are separate activities with separate evidence.

### 6. Security and regulatory assurance

Independent penetration testing, vulnerability remediation, privacy review, disaster-recovery exercise, supplier assurance and regulatory assessment occur before pilot.

### 7. Controlled pilot

Run in one Accra and one Tamale workflow with synthetic data first, then a formally authorized limited cohort. Define stop criteria, clinical escalation and rollback before launch.

### 8. Operational rehearsal and release

Exercise surge booking, lost devices, network failure, Saudi connectivity loss, emergency triage, evacuation, duplicate identity, notification failure and total downtime.

### 9. Maintenance and retirement

Operate controlled releases, incident management, patching, audit review, annual access recertification, clinical-rule revalidation and a documented data-retention/export/disposal process.

## Roles

| Role | Core accountability |
|---|---|
| Product owner | Scope, priorities and acceptance |
| Clinical safety officer | Hazard log, rule approval and clinical validation |
| Medical Director | Clinical governance and certificate authentication |
| Data protection officer | DPIA, lawful basis, rights and breach process |
| Technical lead | Architecture, code quality and delivery |
| Security lead | Threat model, controls and assurance |
| QA lead | Test strategy, traceability and release evidence |
| Operations lead | Availability, support, recovery and rehearsals |

## Change control

Every change receives an identifier, rationale, impact assessment, acceptance criteria and reviewer. Changes affecting clinical rules, access, certificates, identity, privacy or data retention require specialist approval. Emergency fixes are documented retrospectively within one working day.

## Definition of done

- Requirement and acceptance criteria linked
- Authorization and tenant/patient scope tested
- Validation and duplicate behaviour tested
- Audit and notification effects tested
- Accessibility and mobile layout checked
- No high/critical security finding outstanding
- Documentation and migration updated
- Clinical approval recorded when applicable
