# HajjMed local development environment

This environment is for development with synthetic data only. It is not approved for real pilgrim health, passport or contact information.

## Running services

- Web prototype: `http://127.0.0.1:8080/`
- Backend API: `http://127.0.0.1:4000/`
- API documentation: `http://127.0.0.1:4000/docs`
- PostgreSQL: `127.0.0.1:5432`, database `hajjmed`

PostgreSQL 17.11 is stored under `work/postgresql-portable` and listens only on localhost. It is not installed as a Windows service.

## Seeded development account

- Role: Medical Director
- Email: `director@hajjmed.local`
- Initial password: `Change-Me-Immediately-2027!`

The initial password is for local synthetic testing only and must never be reused in a pilot or production deployment.

## Verification completed

- Prisma migration deployed successfully.
- Medical Director and the Accra, Tamale, Makkah, Mina and Arafat facilities seeded.
- Password authentication tested.
- OTP challenge creation and verification tested in demo mode.
- Authenticated Medical Director dashboard tested against PostgreSQL.

## Production requirements

Before real data is used, replace development secrets, disable OTP demo mode, configure approved SMS/email providers, deploy HTTPS, procure encrypted object storage, implement managed backups and recovery, complete penetration testing, validate clinical rules, perform a DPIA and obtain the required Ghanaian regulatory approvals.
