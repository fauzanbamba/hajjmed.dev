# Deployment checklist

## Environment setup

- [ ] Production environment separated from development
- [ ] Managed PostgreSQL configured
- [ ] Managed Redis configured
- [ ] Load balancer and HTTPS certificate active
- [ ] WAF and DDoS protection active
- [ ] Secrets manager configured
- [ ] Backup vault configured
- [ ] Monitoring and alerting configured

## Build and release

- [ ] CI workflow passes
- [ ] Lint passes
- [ ] Build passes
- [ ] Test suite passes
- [ ] Artifact signed and retained
- [ ] Migration rehearsal passed
- [ ] Rollback plan documented and tested

## Production launch gate

- [ ] Threat model complete
- [ ] DPIA complete
- [ ] Penetration test complete
- [ ] Clinical validation complete
- [ ] Incident response team assigned
- [ ] Release sign-off obtained
