# HajjMed 2027 — Latest consolidated update

> Historical snapshot prepared 11 September 2026. Its verification covers the older Prisma-based `source/production-platform/` tree, not the active Supabase-based `production-platform/`. It is not current build or release evidence.

This handoff incorporates the current web demo, backend source, mobile application source, database schema, compiled API, configuration examples, development documentation and operational reference materials.

## Latest controls incorporated

- Protected VIP/walk-in appointments are exempt from the 24-hour appointment rule, but remain restricted to the Administrator and Medical Director and retain capacity/session controls.
- Daily screening registers are available to both leadership roles with Excel, CSV, JSON and print/PDF output.
- Administrative exports cover clinical, operational, pharmacy, communication, facility and audit datasets. Extensive date, region, agent, gender, outcome/status, facility, authentication and text filters are supported, together with field-level selection.
- Medical fitness certificates require separate Administrator and Medical Director authentication before release.
- Unified QR credentials are downloadable only after the same dual authentication.
- The leadership Certificate and Credential Centre is restricted to the Pilgrim Registry and separates Health Cards, Medical Fitness Certificates and Unified QR Credentials.
- Both leadership roles can search, select, preview and perform mass print/download actions. Pending protected credentials may be previewed but cannot be printed or downloaded.
- Backend batch controls reject duplicate selections and any protected download containing an unauthenticated record. Successful and rejected actions are audited.

## Verification performed

- Frontend JavaScript syntax validation completed successfully.
- TypeScript backend compilation completed successfully.
- Seventeen automated policy and access-control tests passed.

## Packaging note

Dependency folders and transient Expo caches are excluded from the ZIP because they are reproducible from the supplied package manifests and lockfile. Follow `source/production-platform/LOCAL-DEVELOPMENT.md` to install dependencies and start the system.
