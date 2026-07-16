# Page Two — Educator Reputation Management (Prototype)

A working sales-demo prototype for **Page Two**, a reputation management and personal
SEO service built for educators. The court can clear your name — Page Two makes sure
Google gets the memo.

## What's in the demo

- **Landing page** (`index.html`) — the pitch: problem, how it works, three tiers
  (Audit / Shield / Response), and group-coverage framing for associations and districts.
- **Digital Footprint Audit** (`app.html`) — enter a name + district, watch a simulated
  scan, and get a page-one breakdown with a Reputation Risk Score.
- **SEO Action Plan** — the generated step-by-step suppression campaign.
- **Reputation Shield dashboard** — a 6-month timeline simulation showing owned assets
  rising and lawsuit coverage sinking off page one, plus monitoring alerts.

## Demo data

All names, schools, publications, court cases, and rankings are **fictional**, built
around a demo persona (an Alabama educator who won a wrongful-termination suit but
whose page one is still owned by the lawsuit coverage).

## Going live later

`js/data.js` has a `CONFIG.dataSource` flag. The audit is wired so a real SERP provider
(SerpAPI / DataForSEO) can be dropped in behind a Netlify Function at
`/.netlify/functions/serp-audit` without changing the UI.

## Stack

Static HTML/CSS/JS — no build step. Deploys anywhere; currently on Netlify.
