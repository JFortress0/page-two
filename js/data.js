/* ==========================================================================
   Page Two — Demo Data
   All persons, schools, publications, and search results below are FICTIONAL,
   created for product demonstration purposes only.

   PRODUCTION NOTE: swap `CONFIG.dataSource` to "serp-api" and set an API key
   (SerpAPI / DataForSEO) via environment config to make the audit live.
   ========================================================================== */

const CONFIG = {
  dataSource: "demo",          // "demo" | "serp-api"
  serpApiEndpoint: "/.netlify/functions/serp-audit", // stub for future live integration
};

/* Demo persona: a distinctive-named Alabama educator who WON a wrongful
   termination lawsuit — but the coverage still owns page 1 of Google. */
const DEMO_PERSONA = {
  name: "Marlowe Okafor-Quist",
  title: "8th Grade Science Teacher",
  district: "Baldwin County Public Schools",
  years: 14,
  riskScore: 82, // 0–100, higher = worse
  riskVerdict: "High Exposure",
  riskSummary:
    "7 of the top 10 results for this name are lawsuit coverage or court records. " +
    "The educator prevailed in court — but a parent, principal, or hiring committee " +
    "googling this name today sees the accusation before the vindication. Zero owned, " +
    "professional assets currently rank on page 1.",
  serpResults: [
    {
      pos: 1,
      title: "Baldwin County teacher sues district over wrongful termination",
      url: "gulfcoastledger.com › news › education",
      snippet:
        "Marlowe Okafor-Quist, a science teacher at Fairhope Middle School, filed suit against Baldwin County Public Schools alleging wrongful termination following a disputed classroom incident…",
      type: "negative",
      tag: "Lawsuit coverage",
    },
    {
      pos: 2,
      title: "Jury sides with teacher in Baldwin County lawsuit",
      url: "gulfcoastledger.com › news › courts",
      snippet:
        "A jury found in favor of Marlowe Okafor-Quist on Thursday, awarding damages and ordering reinstatement. The district said it was 'reviewing its options'…",
      type: "negative",
      tag: "Lawsuit coverage",
    },
    {
      pos: 3,
      title: "Okafor-Quist v. Baldwin County Board of Education — Case Summary",
      url: "courtlistener.com › docket",
      snippet:
        "Civil case filed in the Circuit Court of Baldwin County, Alabama. Wrongful termination; verdict for plaintiff. Docket, filings, and opinions…",
      type: "negative",
      tag: "Court record",
    },
    {
      pos: 4,
      title: "Teacher lawsuit sparks heated school board meeting",
      url: "baldwintalk.com › forum › schools",
      snippet:
        "Thread: Anyone following the Okafor-Quist lawsuit? Parents sound off on the termination controversy at Fairhope Middle…",
      type: "negative",
      tag: "Community forum",
    },
    {
      pos: 5,
      title: "Marlowe Okafor-Quist — RateMyTeachers",
      url: "ratemyteachers.com › alabama",
      snippet:
        "3 ratings, last updated 6 years ago. Outdated profile with incomplete information…",
      type: "neutral",
      tag: "Stale profile",
    },
    {
      pos: 6,
      title: "Wrongful termination suits on the rise in Alabama school districts",
      url: "aldailyeducation.com › analysis",
      snippet:
        "…cases like Okafor-Quist v. Baldwin County highlight a growing trend of litigation between educators and districts across the state…",
      type: "negative",
      tag: "Lawsuit coverage",
    },
    {
      pos: 7,
      title: "Court records: Okafor-Quist verdict and damages award",
      url: "unicourt.com › case",
      snippet:
        "Aggregated court record listing. Party names, case status, and judgment details available with account…",
      type: "negative",
      tag: "Court record",
    },
    {
      pos: 8,
      title: "Fairhope Middle School — Staff Directory",
      url: "bcbe.org › fairhope-middle › staff",
      snippet: "Staff listing. Okafor-Quist, M — Science Department…",
      type: "neutral",
      tag: "District page",
    },
    {
      pos: 9,
      title: "District settles with reinstated teacher after verdict",
      url: "wkrg-gulfnews.example › local",
      snippet:
        "Following the jury verdict, Baldwin County Public Schools reached a final settlement with the teacher, closing the two-year legal dispute…",
      type: "negative",
      tag: "Lawsuit coverage",
    },
    {
      pos: 10,
      title: "Marlowe Okafor-Quist (@sciencewithMOQ) — X",
      url: "x.com › sciencewithMOQ",
      snippet: "Inactive account. 12 posts, last active 4 years ago…",
      type: "neutral",
      tag: "Inactive social",
    },
  ],
  actionPlan: [
    {
      title: "Claim the exact-name domain and launch a professional hub site",
      desc:
        "Register marloweokafquist.com (and close variants) and publish a fast, schema-marked-up professional site: bio, teaching philosophy, credentials, awards, classroom highlights. Google strongly favors exact-match personal domains for name queries.",
      effort: "Medium",
      impact: "Very High",
      eta: "Weeks 1–2",
      status: "done",
    },
    {
      title: "Build out verified professional profiles",
      desc:
        "LinkedIn (fully completed, headline optimized for name + district), plus verified educator directories. Complete profiles on high-authority domains reliably crack page 1 for low-competition names.",
      effort: "Low",
      impact: "High",
      eta: "Weeks 1–3",
      status: "done",
    },
    {
      title: "Publish a localized professional blog",
      desc:
        "Monthly posts on marloweokafquist.com: science education in Baldwin County, classroom projects, state standards. Fresh, locally-relevant content compounds domain authority over time.",
      effort: "Medium",
      impact: "High",
      eta: "Ongoing",
      status: "active",
    },
    {
      title: "Reactivate and align social presence",
      desc:
        "Refresh the dormant X account and add an Instagram or Facebook educator page under the full professional name. Active social profiles are near-guaranteed page-1 occupants.",
      effort: "Low",
      impact: "Medium",
      eta: "Weeks 2–4",
      status: "active",
    },
    {
      title: "Earn positive third-party coverage",
      desc:
        "Pitch local outlets and district communications on classroom wins: science fair results, grants, student achievements. One positive news story can displace one negative one — same domain authority class.",
      effort: "High",
      impact: "Very High",
      eta: "Months 2–5",
      status: "upcoming",
    },
    {
      title: "Interlink and reinforce every asset",
      desc:
        "Cross-link the hub site, profiles, and coverage; submit sitemaps; keep NAP (name, title, district) consistent everywhere so Google consolidates the entity around content you control.",
      effort: "Low",
      impact: "Medium",
      eta: "Ongoing",
      status: "upcoming",
    },
  ],
};

/* Reputation Shield simulation: rank positions of key URLs over a 6-month
   campaign. Position > 10 means page 2+ (out of sight). */
const SHIELD_SIM = {
  months: ["Baseline", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
  items: [
    { name: "Lawsuit filing story (Gulf Coast Ledger)", type: "negative", ranks: [1, 2, 3, 5, 8, 11, 14] },
    { name: "Verdict story (Gulf Coast Ledger)", type: "negative", ranks: [2, 3, 5, 7, 10, 13, 17] },
    { name: "Court record (CourtListener)", type: "negative", ranks: [3, 4, 6, 9, 12, 15, 19] },
    { name: "Community forum thread", type: "negative", ranks: [4, 6, 9, 13, 18, 22, 26] },
    { name: "Aggregated court record (UniCourt)", type: "negative", ranks: [7, 9, 12, 16, 21, 25, 31] },
    { name: "marloweokafquist.com — professional hub", type: "positive", ranks: [99, 8, 5, 3, 1, 1, 1] },
    { name: "LinkedIn profile", type: "positive", ranks: [14, 5, 3, 2, 2, 2, 2] },
    { name: "Professional blog posts", type: "positive", ranks: [99, 18, 9, 6, 4, 3, 3] },
    { name: "Educator directory profile", type: "positive", ranks: [22, 11, 7, 5, 5, 4, 4] },
    { name: "Positive press: science fair feature", type: "positive", ranks: [99, 99, 99, 11, 6, 5, 5] },
  ],
  alerts: [
    { date: "Jun 28", text: "<strong>Position improved:</strong> marloweokafquist.com holds #1 for \"Marlowe Okafor-Quist\" for 21 consecutive days." },
    { date: "Jun 14", text: "<strong>Threat neutralized:</strong> Community forum thread dropped to page 3 (#26). Visibility near zero." },
    { date: "May 30", text: "<strong>New content detected:</strong> A syndicated copy of the verdict story appeared at #38. Monitoring — no action needed." },
    { date: "May 09", text: "<strong>Milestone:</strong> All lawsuit coverage now ranks on page 2 or lower. Page 1 is 100% owned or neutral assets." },
    { date: "Apr 22", text: "<strong>Position improved:</strong> Science fair press feature entered page 1 at #6." },
    { date: "Mar 15", text: "<strong>Alert:</strong> Court record briefly returned to #9 after a Google core update. Countered with two new blog posts + fresh interlinks; resolved in 11 days." },
  ],
};

/* Rotating fictional educators for the audit input placeholder */
const SAMPLE_QUERIES = [
  { name: "Marlowe Okafor-Quist", district: "Baldwin County Public Schools" },
];
