/* ==========================================================================
   Page Two — Live Digital Footprint Audit
   Netlify Function backed by Google's Custom Search JSON API.

   Env vars (set in Netlify, never exposed to the browser):
     GOOGLE_CSE_KEY — API key for the Custom Search JSON API
     GOOGLE_CSE_CX  — Programmable Search Engine ID (configured to search the web)

   Free tier: 100 queries/day, hard-capped by Google (no billing = no charges).
   ========================================================================== */

const NEGATIVE_TERMS = [
  "lawsuit", "sues", "sued", "suing", "litigation", "court", "verdict", "settle",
  "settlement", "arrest", "arrested", "charged", "charges", "indicted", "fired",
  "terminated", "termination", "suspended", "suspension", "resigns", "resigned",
  "investigation", "investigated", "probe", "complaint", "misconduct", "scandal",
  "allegation", "alleged", "accuses", "accused", "controversy", "dispute",
  "docket", "plaintiff", "defendant", "v.", "vs.",
];

const COURT_DOMAINS = [
  "courtlistener.com", "unicourt.com", "trellis.law", "pacermonitor.com",
  "justia.com", "casetext.com", "law360.com", "leagle.com", "plainsite.org",
  "judyrecords.com", "docketbird.com",
];

const RECORD_AGGREGATORS = [
  "mylife.com", "spokeo.com", "beenverified.com", "whitepages.com",
  "truepeoplesearch.com", "fastpeoplesearch.com", "radaris.com", "intelius.com",
  "instantcheckmate.com", "peoplefinders.com", "arrests.org", "mugshots.com",
];

const OWNED_DOMAINS = [
  "linkedin.com", "facebook.com", "instagram.com", "x.com", "twitter.com",
  "youtube.com", "tiktok.com", "about.me", "medium.com", "substack.com",
  "wordpress.com", "wixsite.com", "squarespace.com", "sites.google.com",
];

const FORUM_DOMAINS = ["reddit.com", "topix.com", "quora.com", "nextdoor.com", "greatschools.org", "niche.com", "ratemyteachers.com"];

function nameSlugMatches(host, name) {
  const slug = name.toLowerCase().replace(/[^a-z]/g, "");
  const h = host.toLowerCase().replace(/[^a-z]/g, "");
  return slug.length > 5 && h.includes(slug.slice(0, Math.min(slug.length, 12)));
}

function classify(item, name) {
  const host = (() => { try { return new URL(item.link).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  const text = ((item.title || "") + " " + (item.snippet || "")).toLowerCase();

  if (COURT_DOMAINS.some((d) => host.endsWith(d))) return { type: "negative", tag: "Court record" };
  if (RECORD_AGGREGATORS.some((d) => host.endsWith(d))) return { type: "negative", tag: "Data broker" };

  const negHits = NEGATIVE_TERMS.filter((t) => text.includes(t)).length;
  const isNewsy = /news|ledger|times|herald|tribune|gazette|journal|wkrg|wsfa|waff|al\.com|advertiser/.test(host);

  if (negHits >= 2 || (negHits >= 1 && isNewsy)) {
    return { type: "negative", tag: isNewsy ? "News coverage" : "Negative mention" };
  }
  if (nameSlugMatches(host, name)) return { type: "positive", tag: "Owned domain" };
  if (OWNED_DOMAINS.some((d) => host.endsWith(d))) return { type: "positive", tag: "Profile you can own" };
  if (FORUM_DOMAINS.some((d) => host.endsWith(d))) return { type: "neutral", tag: "Forum / review site" };
  if (/\.(k12\.[a-z]{2}\.us|edu)$/.test(host) || /schools|district|bcbe|boe/.test(host)) {
    return { type: "neutral", tag: "School / district page" };
  }
  return { type: "neutral", tag: "Other" };
}

/* Risk score: positions weighted heavily at the top of page 1. */
const POSITION_WEIGHTS = [22, 18, 15, 12, 9, 7, 6, 5, 3, 3]; // sums to 100

function scoreResults(results) {
  let score = 0;
  results.forEach((r, i) => {
    const w = POSITION_WEIGHTS[i] ?? 2;
    if (r.type === "negative") score += w;
    else if (r.type === "neutral") score += w * 0.25;
  });
  return Math.min(100, Math.round(score));
}

function verdict(score) {
  if (score >= 60) return "High Exposure";
  if (score >= 30) return "Moderate Exposure";
  if (score >= 12) return "Low Exposure";
  return "Well Protected";
}

function summarize(results, score, name) {
  const neg = results.filter((r) => r.type === "negative").length;
  const own = results.filter((r) => r.type === "positive").length;
  const parts = [];
  parts.push(
    neg === 0
      ? "No clearly negative links detected on page one."
      : `${neg} of the top ${results.length} results appear negative or high-risk.`
  );
  parts.push(
    own === 0
      ? "No owned, professional assets currently rank — page one is entirely out of your control."
      : `${own} result${own > 1 ? "s" : ""} on page one ${own > 1 ? "are" : "is"} an asset you own or could claim.`
  );
  parts.push("Automated classification is a starting point — a human review refines every audit.");
  return parts.join(" ");
}

export default async (req) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

  const KEY = process.env.GOOGLE_CSE_KEY;
  const CX = process.env.GOOGLE_CSE_CX;
  if (!KEY || !CX) {
    return new Response(JSON.stringify({ ok: false, reason: "not-configured" }), { status: 200, headers });
  }

  let name = "", district = "";
  try {
    const body = await req.json();
    name = String(body.name || "").trim().slice(0, 80);
    district = String(body.district || "").trim().slice(0, 100);
  } catch {
    return new Response(JSON.stringify({ ok: false, reason: "bad-request" }), { status: 400, headers });
  }
  if (name.length < 3) {
    return new Response(JSON.stringify({ ok: false, reason: "bad-request" }), { status: 400, headers });
  }

  const q = district ? `"${name}" ${district}` : `"${name}"`;
  const url =
    "https://www.googleapis.com/customsearch/v1?key=" + encodeURIComponent(KEY) +
    "&cx=" + encodeURIComponent(CX) +
    "&num=10&q=" + encodeURIComponent(q);

  let data;
  try {
    const res = await fetch(url);
    data = await res.json();
    if (!res.ok) {
      const reason = res.status === 429 || data?.error?.errors?.[0]?.reason === "dailyLimitExceeded"
        ? "quota-exhausted"
        : "upstream-error";
      return new Response(JSON.stringify({ ok: false, reason, detail: data?.error?.message }), { status: 200, headers });
    }
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, reason: "upstream-error" }), { status: 200, headers });
  }

  const items = (data.items || []).slice(0, 10);
  const results = items.map((item, i) => {
    const c = classify(item, name);
    let displayUrl = item.displayLink || item.link;
    try {
      const u = new URL(item.link);
      const pathBits = u.pathname.split("/").filter(Boolean).slice(0, 2).join(" › ");
      displayUrl = u.hostname.replace(/^www\./, "") + (pathBits ? " › " + pathBits : "");
    } catch {}
    return {
      pos: i + 1,
      title: item.title || "(untitled)",
      url: displayUrl,
      link: item.link,
      snippet: item.snippet || "",
      type: c.type,
      tag: c.tag,
    };
  });

  const score = scoreResults(results);
  return new Response(
    JSON.stringify({
      ok: true,
      query: q,
      totalResults: data.searchInformation?.totalResults ?? null,
      results,
      riskScore: score,
      riskVerdict: verdict(score),
      riskSummary: summarize(results, score, name),
      live: true,
    }),
    { status: 200, headers }
  );
};

export const config = { path: "/api/serp-audit" };
