# Production technical launch checklist

This checklist captures the technical launch gates required for the HajjMed 2027 platform before real production use.

## 1. Infrastructure

- [ ] Separate development, test, validation, pilot and production environments
- [ ] Managed PostgreSQL with high availability and point-in-time recovery
- [ ] Managed Redis for OTP, queue and caching needs
- [ ] HTTPS load balancer in front of API instances
- [ ] WAF or edge filtering enabled
- [ ] DDoS protection and traffic control configured
- [ ] Private networking between app, database and supporting services
- [ ] Encrypted object storage for photos and documents
- [ ] TLS certificates provisioned and auto-renewed
- [ ] CDN/static hosting configured for the web client

## 2. Deployment pipeline

- [ ] CI pipeline runs lint, build and tests
- [ ] Dependency scanning is in CI
- [ ] Container image scanning is enabled
- [ ] Signed build artifacts are produced
- [ ] Staging smoke tests run before production
- [ ] Database migration rehearsal is performed in validation
- [ ] Production deployment uses controlled rolling release or blue/green strategy
- [ ] Rollback plan tested for API and schema changes
- [ ] Change window and owner approval are tracked

## 3. Runtime configuration and environment security

- [ ] `.env` files are not committed to source control
- [ ] Production secrets are stored in a managed secret store
- [ ] JWT secrets are unique and different from each other
- [ ] OTP pepper is unique and not a placeholder
- [ ] Demo OTP mode is disabled in production
- [ ] App origins are HTTPS-only in production
- [ ] Placeholder values are rejected by runtime validation
- [ ] Example credentials are never reused in production

## 4. Backend hardening

- [ ] Request validation enforced with Zod or equivalent
- [ ] Security headers enabled
- [ ] Rate limiting enabled
- [ ] CORS restricted to trusted origins
- [ ] Sensitive data redacted from logs
- [ ] Health endpoints are implemented
- [ ] Error handling avoids leaking internals
- [ ] Idempotent operations are protected against duplicate requests
- [ ] Audit events are recorded for privileged and sensitive actions

## 5. Database and data protection

- [ ] Production backup schedule is configured and tested
- [ ] Restore procedure has been proved successfully
- [ ] RPO and RTO are approved by the operational owner
- [ ] Database encryption at rest is enabled
- [ ] Database credentials are least-privileged and rotated
- [ ] Unique constraints protect identity and appointment integrity
- [ ] Migrations are forward-controlled and reviewed before apply
- [ ] No migration edits after deployment
- [ ] Integrity checks run after schema update

## 6. Authentication and authorization

- [ ] Password hashing implemented with Argon2 or equivalent
- [ ] OTP flow tested with approved channel provider
- [ ] Refresh-token rotation is enabled
- [ ] Session expiry and revocation are enforced
- [ ] MFA required for high-privilege roles
- [ ] Role hierarchy validated
- [ ] Pilgrim/agency scoping validated
- [ ] Break-glass access is controlled and audited
- [ ] Override actions are subject to reason and audit review

## 7. Clinical and regulatory controls

- [ ] Clinical rules are versioned and approved
- [ ] Screening and certificate logic is validated against adverse cases
- [ ] Wrong-patient protections are tested
- [ ] Duplicate record protections are tested
- [ ] Abnormal-result escalation and review are tested
- [ ] Medical Director authentication is enforced for certificate issuance
- [ ] Privacy impact assessment completed
- [ ] Data retention and lawful-basis review completed
- [ ] Regulatory approvals obtained for actual production use

## 8. Observability and operations

- [ ] API metrics and error tracking enabled
- [ ] Database health monitoring active
- [ ] Queue and notification health monitored
- [ ] Audit-chain validation monitoring active
- [ ] Backup success monitored and alerted
- [ ] Named on-call owner for incidents
- [ ] Incident response plan tested
- [ ] Recovery drill completed
- [ ] Downtime reconciliation plan exists

## 9. Release gate

A production release may proceed only when all of the following are complete:

- [ ] Threat model reviewed and accepted
- [ ] Access matrix completed
- [ ] DPIA completed
- [ ] Penetration test completed and remediations retested
- [ ] Security and dependency scan completed
- [ ] Backup/restore proof accepted
- [ ] Incident exercise completed
- [ ] Clinical validation signed off
- [ ] Product owner and release authority approval received
- [ ] Residual risk acceptance signed

## 10. Final decision

Production launch is permitted only after the release gate is signed and the operational, security and clinical approvals are complete. Until then, the system should remain in development or restricted pilot status only.
