# Tilet Art Gallery — Authentication setup

## 1. Supabase Auth URLs

In Supabase → Authentication → URL Configuration:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

When the site is deployed, add the production callback URL too.

## 2. Environment

Keep your existing `.env.local`, or create it from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Do not add the database password or service/secret key to a `NEXT_PUBLIC_*` variable.

## 3. Install and run

```powershell
npm.cmd install
npm.cmd run dev
```

## 4. Test buyer authentication

1. Open `http://localhost:3000/signup`.
2. Create an account.
3. If email confirmation is enabled, open the Supabase confirmation email.
4. The callback should return to `/account`.
5. The account should show role `buyer`.
6. Log out and log back in through `/login`.

## 5. Test artist application

1. Log in as the buyer.
2. Open `/become-an-artist`.
3. Save a draft.
4. Return and submit it.
5. `/account` should show the application reference and status.

## 6. Create the first admin

After you have created your own account through the app, use Supabase SQL Editor once:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'YOUR-ADMIN-EMAIL'
);
```

Replace `YOUR-ADMIN-EMAIL` with your own account email. Then log out and back in. The header and account page will expose the Admin dashboard.

## Phase boundary

Authentication and artist application persistence are connected. Artwork lists, dashboard metrics, admin queues, artwork uploads, and orders are still demo data and are the next implementation phase.
