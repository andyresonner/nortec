# Nortec — Northbound Talent.

**Remote AI + tech jobs, salary signals, and career playbooks for Latin America.**

Work global. Live local. / Trabaja global. Vive en LatAm.

---

## Project structure

```
nortec/
├── index.html          # Homepage (hero, jobs, salary, why, CTA)
├── vercel.json         # Vercel routing config (clean URLs)
├── css/
│   └── global.css      # Design system, tokens, all shared styles
├── js/
│   ├── components.js   # Shared nav/footer/ticker (ES module)
│   ├── jobs.js         # Job data + salary data (ES module)
│   └── subscribe.js    # Supabase email capture
└── pages/
    ├── jobs.html        # Full job board with filters
    ├── tracker.html     # LatAm remote job tracker + welcome survey
    ├── archive.html     # Issue archive
    ├── sponsors.html    # Media kit / employer page
    └── issue-001.html   # First newsletter issue (web version)
```

---

## Deploy to Vercel (< 5 minutes)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "init: Nortec v1"
git remote add origin https://github.com/YOUR_USERNAME/nortec.git
git push -u origin main
```

### 2. Connect to Vercel

- Go to [vercel.com](https://vercel.com) → New Project
- Import your GitHub repo
- Framework: **Other** (static HTML)
- Root directory: `/` (leave default)
- Click Deploy

Done. Vercel handles the routing via `vercel.json`.

### 3. Custom domain (optional)

In Vercel project settings → Domains → Add `nortec.com` (or whatever you registered).

---

## Email capture — Supabase setup

### Create the subscribers table

In your Supabase project → SQL editor → run:

```sql
create table subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source text,
  country text,
  current_role text,
  seniority text,
  english_level text,
  work_status text,
  target_salary text,
  stack text,
  goal text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Allow anonymous inserts (for email capture)
alter table subscribers enable row level security;

create policy "Allow anonymous insert"
  on subscribers for insert
  with check (true);
```

### Add your Supabase credentials

In `js/subscribe.js`, replace:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Or set as Vercel environment variables (recommended):

In Vercel → Settings → Environment Variables:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

Then update `subscribe.js` to use:
```js
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
```

### Survey data

The post-signup survey (on `/tracker?welcome=1`) currently logs to console.
To save to Supabase, extend `subscribe.js` with a PATCH to the subscribers table using the email as a lookup key.

---

## Sending the newsletter

We recommend **Beehiiv** or **Resend** for sending:

- **Beehiiv**: paste the HTML from `pages/issue-001.html` into their editor. Use their referral system.
- **Resend**: programmatic sends with your own domain. Pair with a simple admin UI.
- The web version at `/issue/001` serves as the public archive page automatically.

---

## Weekly workflow

| Day | Task |
|-----|------|
| Mon | Pull jobs from: Remote Rocketship, Get on Board, LatHire, Greenhouse, Lever, LinkedIn |
| Tue | Verify LatAm eligibility, score each role, write why/apply angle |
| Wed | Write issue copy, update `jobs.js` with new listings |
| Thu | Publish issue (web + email), post 3 LinkedIn/X posts |
| Fri | Update tracker, follow up sponsor CRM |

---

## Adding new jobs

Edit `js/jobs.js` — add to the `JOBS` array:

```js
{
  id: 'j006',
  company: 'Company Name',
  title: 'Role Title',
  location: 'Remote · LatAm',
  type: 'Full-time',
  salary: '$80K–$120K',
  salaryNum: 80000,
  tags: ['Python', 'AWS'],
  function: 'Engineering',  // Engineering | Customer Success | QA | Data & AI | Design | Product
  latamEligible: true,
  englishRequired: true,
  tzOverlap: 'US ET / Flexible',
  aiRelevance: true,
  link: 'https://...',
  source: 'Greenhouse',
  sourceDate: '2026-05-09',
  score: 4,          // 1–5
  why: 'Why this role matters for LatAm candidates...',
  applyAngle: 'How to position yourself...',
}
```

---

## Brand

- **Fonts**: Oswald (display), IBM Plex Mono (UI/code), Libre Baskerville (body)
- **Colors**: `#F2E9D5` (North Star cream), `#0FA39A` (Teal Depth), `#FF4B28` (Orient Red), `#0A1A1C` (Midnight), `#5A5F57` (Atlas Gray)
- **Tagline**: Work global. Live local. / Trabaja global. Vive en LatAm.
- **Tone**: Direct, bilingual, editorial, opinionated — not generic

---

## Monetization sequence

1. **Featured jobs** ($49–$199/post) → start here
2. **Newsletter sponsors** ($499+/issue) → after 1K subs
3. **Nortec Pro** ($8–15/mo) → after 3K subs
4. **Talent network** (recruiter access) → after 10K subs

---

Built in Bogotá 🇨🇴 · Designed for the world.
