# Deploying Behind The Cut to Vercel

The site is a standard Next.js 16 (App Router) app — Vercel detects it
automatically. No special configuration is needed beyond the environment
variables below.

## 1. Push to Git and import

1. Commit everything and push the repository to GitHub / GitLab / Bitbucket.
2. On [vercel.com](https://vercel.com) → **Add New… → Project** → import the repo.
3. Framework preset is detected as **Next.js**. Leave the build command
   as `bun run build` / `npm run build` (it runs `prisma generate && next build`).
4. Click **Deploy**. The first build takes a couple of minutes.

## 2. Environment variables (Settings → Environment Variables)

| Variable             | Required | Value                                                        |
| -------------------- | -------- | ------------------------------------------------------------ |
| `ADMIN_PASSWORD`     | **YES**  | A long random password. `/admin` stays **locked** without it. |
| `ADMIN_SECRET`       | Advice   | Another long random string. Signs the admin session cookie.   |
| `NEXT_PUBLIC_SITE_URL` | Advice | Your final URL, e.g. `https://your-domain.com` — used for Open Graph + sitemap. |
| `BLOB_READ_WRITE_TOKEN` | For uploads | See “Video uploads” below. |
| `DATABASE_URL`       | No       | Leave **unset** on Vercel (see “Database” below).             |

After adding variables, **redeploy** once so they take effect.

## 3. Video uploads from the admin panel

The **Recent cuts** and **Showreel** forms accept media two ways: paste any
URL (unchanged), or use the **UPLOAD** tab to drop the actual video/poster
file straight from your computer.

How storage is picked, automatically:

- **With `BLOB_READ_WRITE_TOKEN` set (recommended on Vercel):** files are
  streamed from the browser directly to **Vercel Blob** storage and the
  returned public URL is saved. Get the token from
  Vercel → your project → **Storage → Blob → Connect** (or create a store
  in the dashboard), then copy the read-write token into the environment
  variables. Blob's free tier (1GB+) is plenty for a showreel.
  This path has no file-size limit issues — the file never passes through
  a serverless function.
- **Without the token (local dev / self-hosted):** files are written to the
  server's `uploads/` directory and served through `/api/uploads/…` with
  HTTP Range streaming. Limits: 200MB video, 5MB poster.

On Vercel **without** a Blob token the upload tab still works in local-disk
mode, but storage lands in the instance's `/tmp` — it resets on cold starts
and redeployments, so set the token for anything real.

## 4. Admin panel

- URL: `https://your-site.vercel.app/admin` — there is no link to it
  anywhere on the public site, exactly as requested.
- Log in with the `ADMIN_PASSWORD` you set. Sessions last 7 days.
- From the panel you can: read project briefs (with WhatsApp / email
  reply links), add / edit / remove **Recent cuts**, and change the
  **SHOWREEL — 2026** label, video and poster. The public site updates
  on the next visit — no rebuild required.

## 5. Database — how it behaves on Vercel

The app uses SQLite and **bootstraps itself**: on first request it
creates its tables and seeds the showreel settings + three starter cuts.
That means a fresh deploy always works with zero configuration.

- With `DATABASE_URL` unset, Vercel uses `/tmp/behind-the-cut.db`.
  `/tmp` is **per server instance and resets on cold starts**, so briefs
  and cuts saved there live as long as the instance stays warm — and are
  re-seeded fresh after a restart or redeploy.
- Client briefs are **never lost** either way: submitting the brief also
  opens WhatsApp with every detail pre-filled, which is your primary inbox.

If you want briefs to survive restarts/redeploys, point the app at a
managed database later (e.g. Vercel Postgres / Neon — free tier). That
is a small schema change; ask for it when ready.

## 6. Local development

```bash
bun install          # runs prisma generate automatically
bun run dev          # http://localhost:3000
bun run build        # production build check
```

Local dev uses `db/custom.db` (auto-created and seeded) and the admin
default password `cutroom-admin` — production always requires a real
`ADMIN_PASSWORD`.
