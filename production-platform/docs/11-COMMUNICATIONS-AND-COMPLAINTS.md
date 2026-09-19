# Stakeholder communications and complaints

## Purpose

The communications module provides patient-linked, in-platform messaging. An accredited agent may lodge a complaint or enquiry only for a pilgrim assigned to that agent's accredited organization. Pilgrims may communicate about their own record. Doctors, nurses, administrators and the Medical Director may review and respond within their permitted operational scope.

The module is not an emergency-response channel. The interface warns users to contact emergency services or the nearest HajjMed clinic for severe or life-threatening symptoms.

## Access controls

- Every thread is linked to one pilgrim and records the pilgrim's organization at creation.
- Agent access is enforced by comparing the authenticated user's organization with the thread and pilgrim organization.
- Pilgrim access is restricted to the authenticated user's own pilgrim record.
- Allied-health accounts remain excluded to preserve their results-and-orders-only scope.
- Unauthorized thread access returns `404` to avoid disclosing that another patient's conversation exists.
- Only administrators and the Medical Director can assign a thread to an active doctor or nurse.
- Clinical staff and leadership can mark a thread in review, resolved or closed. An agent may close a conversation in their permitted scope.

## Record integrity

- Messages are append-only and have no update or delete endpoint.
- Closed conversations reject new messages.
- Thread creation, reading, messaging and status changes create audit-chain events.
- Each message stores its author and server-generated timestamp.
- Subjects and message lengths are validated at the API boundary.

## API endpoints

- `GET /api/v1/communications`
- `POST /api/v1/communications`
- `GET /api/v1/communications/:id`
- `POST /api/v1/communications/:id/messages`
- `PATCH /api/v1/communications/:id`

Production deployment must connect message events to the approved notification provider. Notifications should contain only a neutral prompt to sign in; protected clinical content must not be included in SMS or ordinary email.
