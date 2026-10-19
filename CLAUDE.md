# Kalapoorti

Kalapoorti (Hindi: kala = skill/art, poorti = fulfilment) is a peer-to-peer platform where people learn hobbies and skills from each other. Example: one person knows AI and wants to learn flute; another knows flute and wants to learn AI; the platform matches them so they teach each other. Later it will also support co-learning (people learning the same skill at the same time) and skill-tagged articles.

Target users: individual learners (B2C). Domain: kalapoorti.com.

## About the developer

Data scientist (1-2 years of Python), new to web development. Explain frontend and web concepts briefly as we go, prefer simple and readable code over clever code, and make small changes that can be tested one at a time.

## Stack (all free tiers)

- Frontend: React + Vite + Tailwind CSS (plain JavaScript/JSX), hosted on Cloudflare Pages
- Database, auth and API: Supabase (Postgres + Supabase Auth + Row Level Security), accessed from the frontend with supabase-js
- Email: Resend (signup confirmations and notifications), connected to Supabase Auth as custom SMTP
- Incoming mail: Cloudflare Email Routing (forwarding only)
- Analytics: Google Analytics (GA4)
- Possible later: a small Python (FastAPI) service for recommendations and ranking, reading from Supabase

There is no custom backend server in the MVP. Cloudflare Pages serves static files only.

## Database

The schema lives in `supabase/schema.sql` (already applied in Supabase). Tables: `profiles`, `skills`, `user_skills` (kind = 'teach' or 'learn'), `connection_requests`, `messages`. Matching uses the `find_matches()` SQL function.

Rules:
- Any schema change goes in a new numbered file in `supabase/` (for example `002_add_xyz.sql`) so there is a history. I run it manually in the Supabase SQL Editor.
- Every new table must have Row Level Security enabled with policies written at the same time.

## Security rules (important)

- Use only the Supabase anon (public) key in the frontend. Never use or expose the service_role key anywhere in frontend code.
- Keep keys in `.env.local` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). It must be in `.gitignore` and never committed.
- Never hardcode secrets, passwords or API keys in code.

## Build order

1. Accounts and DNS: domain on Cloudflare, Supabase project, GitHub repo (done: domain bought, Supabase project created)
2. Database schema in Supabase (done)
3. Auth and profiles: signup/login, profile page where users pick skills they teach and want to learn
4. Matching and connections: "Your matches" page (find_matches), send/accept/decline requests, email notifications via Resend
5. Deploy and measure: Cloudflare Pages from GitHub, attach kalapoorti.com, add GA4

Work on one step at a time. Finish and test a step before starting the next, and tell me when it is a good moment to commit to Git.

## Commands

- Install: `npm install`
- Run locally: `npm run dev`
- Production build: `npm run build`

## Out of scope for now

Articles, resource recommendations, co-learning groups, payments, mobile app.
