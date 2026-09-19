# Monitoring and alerting checklist

## Core metrics

- API availability and latency
- Error rate by endpoint
- Database connection saturation
- Redis health and queue depth
- OTP issuance and verification failures
- Notification failure rates
- Authorization denials and override events
- Audit-chain validation failures
- Backup success/failure events

## Alerting rules

- API error threshold exceeded for 5 minutes
- Database latency or connection pool saturation
- Redis unavailable or queue backlog critical
- OTP failure spike
- Notification delivery failure spike
- Authorization denial spike
- Break-glass or override access triggered
- Backup failure

## Runbook expectations

- Every alert must have a named owner
- Response SLA must be defined
- Escalation path must be documented
- Dashboard and logs must be accessible in operations
- Incident notes must be recorded for every major event
