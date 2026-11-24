# AttoLink — Creator Attribution & Anti-Coupon Leak Micro-SaaS

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Supabase**, **Upstash Redis**, and **Stripe Webhooks**.

## Quick Start in VS Code

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Rename `.env.example` to `.env.local`
   - Paste your free **Supabase** URL & Keys
   - (Optional) Paste your free **Upstash Redis** URL & Token for sub-20ms redirects

3. **Setup Supabase Database:**
   - Open your Supabase Project -> **SQL Editor**
   - Copy and run the contents of `supabase/schema.sql`

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## Key Routes Included
- `/` — High-converting SaaS Landing Page
- `/dashboard` — Brand Owner ROI Dashboard & Link Creator
- `/r/[slug]` — Ultra-fast Edge Redirect Middleware with Anti-Coupon Leak Shield & 30-day cookie tracking
- `/stats/[token]` — Zero-login Public Creator Live Scorecard
- `/api/webhook/stripe` — Stripe Checkout conversion listener + Resend email alert
