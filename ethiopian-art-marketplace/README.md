# Tilet Art Gallery — Ethiopian Art Marketplace MVP

A Next.js MVP for a curated Ethiopian art marketplace. The product flow follows the supplied Business & UX Specification: artist onboarding → artwork review/publishing → buyer discovery → purchase request → manual payment verification → preparation → delivery → completion.

## Current phase

Phase 2A connects the original interface to Supabase authentication and artist applications.

Working now:
- public marketplace UI
- Supabase email/password sign up + login + logout
- auth callback for email confirmation
- automatic buyer profile creation (database trigger)
- account page with role-aware actions
- buyer → artist application form with draft/submitted states
- protected Artist Studio routes
- protected Admin routes
- Tilet Art Gallery branding
- production-oriented PostgreSQL schema + RLS in `database/schema.sql`

Still seeded/demo in this phase:
- public artworks and artist cards
- artist dashboard metrics
- admin review queues
- artwork upload/storage
- purchase/order UI data

## Local setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase project URL and publishable key.
4. In Supabase Auth URL Configuration set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
5. Run:
   `npm run dev`

## Test authentication

- Open `/signup`
- Create a buyer account
- Confirm the email if confirmation is enabled
- Open `/login`
- After login `/account` should show the buyer role
- Open `/become-an-artist` to save or submit an artist application

## First admin

Create your normal account through the app first. Then promote only that user from Supabase SQL Editor using the user email you own. Do not expose secret/service-role keys to the browser.
