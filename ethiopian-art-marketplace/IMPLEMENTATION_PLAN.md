# MVP Implementation Plan

## Product rule
Prove one reliable loop before expanding scope:

**Artist:** Apply → approved → profile → upload → artwork approved  
**Buyer:** Discover → view → understand → request purchase  
**Business:** receive request → verify payment → coordinate artist → coordinate delivery  
**Completion:** delivered → completed → sale recorded

## Phase 1 — included in this project
- Responsive public marketplace UI
- Curated homepage
- Artwork discovery and filters UI
- Artwork detail and trust content
- Purchase-request form UI
- Public artist profile
- Artist application UI
- Buyer order/status timeline
- Artist dashboard and artwork submission UI
- Admin queues for applications, artwork review, orders and payments
- PostgreSQL/Supabase-ready schema

## Phase 2 — connect real data
1. Supabase project + environment variables
2. Auth roles: buyer / artist / admin
3. Storage buckets: artist profiles, portfolios, artwork images, payment proofs
4. Server actions for application and artwork submission
5. Admin approval workflows
6. Purchase request transaction that atomically reserves an available original artwork
7. Manual payment submission + admin confirmation
8. Artist "ready for delivery" transition
9. Admin delivery transitions and completion
10. Notifications

## Phase 3 — production hardening
- RLS policies and admin authorization
- Form validation and rate limiting
- Audit log for operational status changes
- Image optimization and upload constraints
- Email/SMS integration
- Reservation expiration job
- Accessibility pass
- Search indexing / SEO / structured data
- Analytics and funnel tracking

## Explicitly deferred from MVP
- Auctions
- Automated online checkout/payment processing
- Multiple international currencies
- International shipping integrations
- Digital downloads
- Advanced recommendations
- Artist subscriptions
- Loyalty system
- Social network / complex messaging
