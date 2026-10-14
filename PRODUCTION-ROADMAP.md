# Production roadmap

## Current working experience

Responsive static landing page with a local class reservation demo, pricing comparison, membership interest dialog and transparent rules-based program generator. This version is suitable for concept review. It cannot operate real subscriptions or shared class bookings.

## Phase 1 — operating MVP

- Member authentication with verified email and secure server sessions.
- Server-backed profiles with optional measurements and field-level consent.
- Coach intake, program approval and member dashboard.
- Payment-provider hosted checkout, server-defined prices, verified webhook signatures and idempotent subscription updates.
- Capacity-aware class booking and cancellation transactions, waitlist and entitlement checks.
- Membership pause/cancel requests and clear billing status.
- Staff dashboard for attendance, scheduling, program review and service support.
- Member data export/deletion, audit records and backups.

Prefer a small, maintainable server application and relational database when the repository and deployment target are selected. Select payment and email providers according to actual business location and availability. Do not place secrets or private coaching data in frontend JavaScript or GitHub Pages.

## Proposed relational entities

| Entity | Essential fields / constraints |
| --- | --- |
| users | id, email unique, role, status, created_at |
| profiles | user_id unique, optional age/measurements, units, preferences, consent version |
| coaches | user_id, verified credentials, specialties, published bio |
| memberships | user_id, plan_id, provider_subscription_id unique, status, current_period_end |
| plans | stable id, currency, price, billing interval, class/PT entitlements |
| class_types | title, duration, equipment, level, description |
| sessions | class_type_id, coach_id, starts_at UTC, club timezone, capacity, status |
| bookings | session_id, user_id, status; prevent duplicate active booking |
| programs | user_id, coach_id, version, status, published_at |
| program_sessions | program_id, weekday/date, exercises, duration, progression notes |
| progress_logs | user_id, program_session_id, attendance, optional effort/feedback |
| consents | user_id, purpose, version, timestamp, withdrawal_at |
| payment_events | provider_event_id unique, processed_at, result |

Use a transaction or atomic capacity constraint when booking. Store dates in UTC, display in the club timezone, and test daylight-saving transitions. Subscription state comes from verified provider events; a checkout redirect alone does not prove payment.

## Access and privacy

Members see their own data. Coaches see assigned members' coaching information. Admin sees the information necessary for membership operations; privileged access is logged. Define retention, export, deletion and recovery procedures. Do not silently turn demo local storage into server persistence. Explain measurement collection and allow omission where it is not necessary.

## Phase 2 — engagement

Coach messaging, calendar export, reminders with explicit notification preferences, progress charts, equipment substitutions, referral credits and business analytics. Launch these only after the core billing and booking journey is reliable.

## Acceptance checks before live release

- Payment success/failure, duplicate webhook delivery, subscription cancellation and entitlement changes.
- Two members competing for the last seat, waitlist promotion, coach cancellation and refunds if applicable.
- Authorization checks across member, coach and admin roles.
- Profile/program deletion, account recovery and backup restore.
- Keyboard navigation, dialog focus, mobile layouts, form errors and reduced motion.
- Final legal/commercial policies, real staff credentials and image usage rights.

## Handoff inputs still required

GitHub owner/repository and visibility; business city and currency; actual operating hours and staff; approved prices and capacity; deployment destination; payment/email providers; final contact details and policies.
