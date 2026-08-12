# hatim.digitaltakeoff.in

Personal résumé and portfolio site for Hatim Nomani. Static HTML and CSS — no build step, no framework, no `node_modules`. Deployed on Vercel.

## Files

| File | What it is |
|---|---|
| `index.html` | The entire site. CSS and JS are inline. |
| `resume.json` | **Source of truth.** JSON Resume schema v1.0.0. Everything else is derived from it. |
| `resume.txt` | Plain-text résumé for naive parsers. |
| `llms.txt` | Structured brief for AI crawlers and sourcing agents. |
| `robots.txt` | Explicitly allows search, AI training and answer-engine crawlers. |
| `sitemap.xml` | Root URL plus the machine-readable files. |
| `Hatim_Nomani_CV_2026.pdf` | The downloadable CV. |
| `api/contact.js` | Vercel serverless function; sends the contact form via Resend. |
| `assets/` | Headshot, favicon, Digital Takeoff mark, Open Graph card. |

## Editing content

**Change `resume.json` first**, then mirror the change into `index.html` and `resume.txt`. Those three must agree — recruiters read the HTML, ATS parsers read the JSON, and inconsistency between them looks like a fabrication.

Also update `llms.txt` when a role, project or availability status changes. It's the file AI sourcing tools will quote back.

### Where the metric placeholders are

Every project on the page has a `TODO(metric)` HTML comment marking where a real outcome number belongs:

```
grep -n "TODO(metric)" index.html
```

Nothing on this site currently claims a percentage, a time saving or an ROI figure, because no such number was verified when it was built. **Only fill these in with numbers you can substantiate.** The figures already present (22 controllers, ~120 endpoints, 11 roles, 18 modules, 22 indexes, 7 applications) describe system scale and are traceable to project documentation.

### Confidentiality

Two engagements are published anonymised and must stay that way:

- The pledge management platform — **no client name, no domain, no internal organisational tier names, no vendor names**.
- The seven-application ASP.NET estate — **"educational institution, Gujarat"** only.

Before pushing content changes, re-run the audit:

```sh
grep -rniE "elam53|elaam|dawaat|hadiyah|saifiyah|siddhpur|jamiat|jamaat|umoor|niyat|karix" \
  --exclude-dir=.git --exclude="*.pdf" .
```

It must return nothing.

### Not shown on the page (present in `resume.json` / `resume.txt` only)

High school, the Building Management System IoT project, and the university committee/volunteer roles. Deliberate — the page is curated, the machine-readable files are complete.

## Local development

```sh
python3 -m http.server 8123
# http://localhost:8123
```

The `/_vercel/insights/script.js` 404 in the console is expected locally; that script only exists on Vercel. The contact form will fail locally too — it needs the serverless function and a Resend key.

## Deployment

Vercel, zero-config. Static files served as-is; `api/` is auto-detected as serverless functions. No `vercel.json` needed.

Environment variables required on the Vercel project (see `.env.example`):

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL` — defaults to `hatimn219@gmail.com`
- `CONTACT_FROM_EMAIL` — defaults to the Resend onboarding sender

```sh
vercel link          # link/create the project
vercel               # preview deploy
vercel --prod        # production
```

Domain `hatim.digitaltakeoff.in` is attached in the Vercel project's Domains settings.

## Regenerating the Open Graph card

`assets/og.png` is a 1200×630 screenshot of a standalone HTML card. To change it, rebuild that card and screenshot it at exactly 1200×630, then replace the file. Keep the dimensions — the `og:image:width` / `og:image:height` meta tags declare them.

## Design system

Inherited from [digitaltakeoff.in](https://digitaltakeoff.in) so the two sites read as one studio:

```css
--m900:#211f1f; --m700:#6b1018; --red:#cc2128; --org:#e86520; --yel:#f5cc00;
--bg:#fcfcfc; --g100:#f5f5f5; --g200:#e8e8e8; --g300:#cccccc; --g500:#888;
--font:'Source Sans 3',sans-serif;
```

Rules that hold the look together: zero border-radius anywhere, 1px hairline borders, 900-weight headings with negative letter-spacing set against 10–11px uppercase labels at `0.28em`, and alternating dark/light full-bleed bands. Two breakpoints only — 768px and 480px.
