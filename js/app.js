/* ==========================================================================
   Page Two — App logic (Audit → Plan → Shield dashboard)
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- View routing (tabs + hash) ---------------- */
  const views = ["audit", "plan", "dashboard"];

  function showView(name) {
    if (!views.includes(name)) name = "audit";
    views.forEach((v) => {
      document.getElementById("view-" + v).classList.toggle("hidden", v !== name);
      document.getElementById("tab-" + v).classList.toggle("active", v === name);
    });
    if (name === "dashboard") initDashboard();
    if (name === "plan") renderPlan();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".app-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      location.hash = tab.dataset.view;
    });
  });

  window.addEventListener("hashchange", () => showView(location.hash.replace("#", "")));

  /* ---------------- Audit ---------------- */
  const form = document.getElementById("audit-form");
  const nameInput = document.getElementById("audit-name");
  const districtInput = document.getElementById("audit-district");
  const scanPanel = document.getElementById("scan-panel");
  const resultsWrap = document.getElementById("audit-results");

  document.getElementById("load-sample").addEventListener("click", () => {
    nameInput.value = DEMO_PERSONA.name;
    districtInput.value = DEMO_PERSONA.district;
    nameInput.focus();
  });

  const SCAN_STEPS = [
    ["Contacting search index…", "query: \"{name}\""],
    ["Scanning page one results…", "query: \"{name} {district}\""],
    ["Classifying links…", "news · court records · forums · owned assets"],
    ["Checking owned-asset coverage…", "personal domains · profiles · directories"],
    ["Computing Reputation Risk Score…", "weighting position × sentiment × authority"],
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim() || DEMO_PERSONA.name;
    const district = districtInput.value.trim() || DEMO_PERSONA.district;
    const isSample = name.toLowerCase() === DEMO_PERSONA.name.toLowerCase();

    resultsWrap.classList.add("hidden");
    scanPanel.classList.remove("hidden");
    scanPanel.scrollIntoView({ behavior: "smooth", block: "center" });

    const statusEl = document.getElementById("scan-status");
    const logEl = document.getElementById("scan-log");
    let i = 0;
    let liveResult = null;
    let liveSettled = isSample; // sample persona never hits the API

    if (!isSample) {
      fetch(CONFIG.serpApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, district: district }),
      })
        .then((r) => r.json())
        .then((d) => { liveResult = d; liveSettled = true; })
        .catch(() => { liveResult = { ok: false, reason: "network" }; liveSettled = true; });
    }

    function finish() {
      scanPanel.classList.add("hidden");
      if (isSample) {
        renderAudit(name, DEMO_PERSONA, { live: false, notice: null });
      } else if (liveResult && liveResult.ok) {
        renderAudit(name, liveResult, { live: true, notice: null });
      } else {
        const reason = liveResult ? liveResult.reason : "network";
        const notices = {
          "not-configured":
            "Live search isn't connected yet — showing the sample educator instead. (Admin: set GOOGLE_CSE_KEY and GOOGLE_CSE_CX in Netlify.)",
          "quota-exhausted":
            "Today's free live-search quota is used up — showing the sample educator instead. Live scans reset at midnight Pacific.",
          "upstream-error": "The search service had a hiccup — showing the sample educator instead.",
          "bad-request": "That name looks too short to scan — showing the sample educator instead.",
          network: "Couldn't reach the scan service — showing the sample educator instead.",
        };
        renderAudit(DEMO_PERSONA.name, DEMO_PERSONA, { live: false, notice: notices[reason] || notices.network });
      }
    }

    function step() {
      if (i < SCAN_STEPS.length) {
        statusEl.textContent = SCAN_STEPS[i][0];
        logEl.textContent = SCAN_STEPS[i][1]
          .replace("{name}", name)
          .replace("{district}", district);
        i++;
        setTimeout(step, 650);
      } else if (!liveSettled) {
        statusEl.textContent = "Waiting on Google’s index…";
        setTimeout(step, 300);
      } else {
        finish();
      }
    }
    step();
  });

  function renderAudit(queriedName, p, opts) {
    opts = opts || { live: false, notice: null };

    const badge = document.getElementById("score-badge");
    const v = p.riskVerdict || "High Exposure";
    badge.textContent = v;
    badge.className =
      "badge " + (p.riskScore >= 60 ? "badge-danger" : p.riskScore >= 30 ? "badge-warn" : "badge-ok");

    const liveBadge = document.getElementById("live-badge");
    liveBadge.textContent = opts.live ? "● Live Google results" : "Simulated demo data";
    liveBadge.className = "badge " + (opts.live ? "badge-ok" : "badge-gold");

    const noticeEl = document.getElementById("scan-notice");
    if (opts.notice) {
      noticeEl.textContent = "⚑ " + opts.notice;
      noticeEl.classList.remove("hidden");
    } else {
      noticeEl.classList.add("hidden");
    }

    document.getElementById("score-verdict").textContent =
      "Searching “" + (queriedName || p.name) + "” — " + v;
    document.getElementById("score-summary").textContent = p.riskSummary;

    // SERP list
    const list = document.getElementById("serp-list");
    list.innerHTML = "";
    const rows = p.serpResults || p.results || [];
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className =
        "result-row " + (r.type === "negative" ? "bad" : r.type === "positive" ? "good" : "");
      const badgeClass =
        r.type === "negative" ? "badge-danger" : r.type === "positive" ? "badge-ok" : "badge-neutral";
      const posCell = document.createElement("div");
      posCell.className = "result-pos";
      posCell.textContent = r.pos;
      const main = document.createElement("div");
      const urlEl = document.createElement("div");
      urlEl.className = "result-url";
      urlEl.textContent = r.url;
      const titleEl = document.createElement("div");
      titleEl.className = "result-title";
      if (r.link) {
        const a = document.createElement("a");
        a.href = r.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style.color = "inherit";
        a.textContent = r.title;
        titleEl.appendChild(a);
      } else {
        titleEl.textContent = r.title;
      }
      const snipEl = document.createElement("div");
      snipEl.className = "result-snip";
      snipEl.textContent = r.snippet;
      main.append(urlEl, titleEl, snipEl);
      const tagCell = document.createElement("div");
      tagCell.className = "result-tag";
      tagCell.innerHTML = '<span class="badge ' + badgeClass + '"></span>';
      tagCell.firstChild.textContent = r.tag;
      row.append(posCell, main, tagCell);
      list.appendChild(row);
    });

    resultsWrap.classList.remove("hidden");
    resultsWrap.scrollIntoView({ behavior: "smooth", block: "start" });

    // Animate score dial
    const arc = document.getElementById("score-arc");
    const nEl = document.getElementById("score-n");
    const target = p.riskScore;
    const scoreColor = target >= 60 ? "#c0392b" : target >= 30 ? "#b9770e" : "#1e7e4e";
    arc.setAttribute("stroke", scoreColor);
    nEl.style.color = scoreColor;
    const circumference = 2 * Math.PI * 86;
    arc.setAttribute("stroke-dasharray", circumference);
    let cur = 0;
    const tick = () => {
      cur = Math.min(cur + 2, target);
      nEl.textContent = cur;
      arc.setAttribute("stroke-dashoffset", circumference * (1 - cur / 100));
      if (cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  document.getElementById("to-plan").addEventListener("click", () => (location.hash = "plan"));
  document.getElementById("to-dash").addEventListener("click", () => (location.hash = "dashboard"));

  /* ---------------- Action plan ---------------- */
  let planRendered = false;
  function renderPlan() {
    if (planRendered) return;
    planRendered = true;
    const wrap = document.getElementById("plan-list");
    DEMO_PERSONA.actionPlan.forEach((a, idx) => {
      const item = document.createElement("div");
      item.className = "plan-item" + (a.status === "done" ? " done" : "");
      const statusBadge =
        a.status === "done"
          ? '<span class="badge badge-ok">Complete</span>'
          : a.status === "active"
          ? '<span class="badge badge-gold">In progress</span>'
          : '<span class="badge badge-neutral">Upcoming</span>';
      item.innerHTML =
        '<div class="plan-num">' + (a.status === "done" ? "✓" : idx + 1) + "</div>" +
        "<div>" +
        '<div class="plan-title">' + a.title + "</div>" +
        '<div class="plan-desc">' + a.desc + "</div>" +
        '<div class="plan-meta">' +
        statusBadge +
        '<span class="badge badge-neutral">Effort: ' + a.effort + "</span>" +
        '<span class="badge badge-gold">Impact: ' + a.impact + "</span>" +
        '<span class="badge badge-neutral">' + a.eta + "</span>" +
        "</div></div>";
      wrap.appendChild(item);
    });
  }

  /* ---------------- Shield dashboard ---------------- */
  let dashInit = false;
  let playTimer = null;

  function fmtRank(r) {
    if (r >= 90) return "—";
    if (r > 10) return "p." + Math.ceil(r / 10) + " · #" + r;
    return "#" + r;
  }

  function renderMonth(m) {
    document.getElementById("month-label").textContent = SHIELD_SIM.months[m];
    const track = document.getElementById("rank-track");
    track.innerHTML = "";

    // sort items by current rank for a live leaderboard feel
    const sorted = [...SHIELD_SIM.items].sort((a, b) => a.ranks[m] - b.ranks[m]);
    sorted.forEach((it) => {
      const r = it.ranks[m];
      const div = document.createElement("div");
      div.className = "rank-item " + it.type;
      div.innerHTML =
        '<div class="ri-name">' + it.name + "</div>" +
        '<div class="ri-pos">' + fmtRank(r) + "</div>";
      track.appendChild(div);
    });

    // KPIs
    const negOn1 = SHIELD_SIM.items.filter((i) => i.type === "negative" && i.ranks[m] <= 10).length;
    const ownOn1 = SHIELD_SIM.items.filter((i) => i.type === "positive" && i.ranks[m] <= 10).length;
    const highestNeg = Math.min(...SHIELD_SIM.items.filter((i) => i.type === "negative").map((i) => i.ranks[m]));
    const risk = Math.max(8, Math.round(82 - (82 - 8) * (m / 6)));

    setKpi("kpi-risk", risk, m, 82, true);
    setKpi("kpi-neg", negOn1, m, 5, true);
    setKpi("kpi-own", ownOn1, m, 0, false);
    document.getElementById("kpi-high").textContent = highestNeg > 10 ? "Page " + Math.ceil(highestNeg / 10) : "#" + highestNeg;
    document.getElementById("kpi-high-delta").innerHTML =
      m === 0 ? '<span class="down">▲ Top of page 1</span>' :
      highestNeg > 10 ? '<span class="up">▼ Off page one entirely</span>' :
      '<span class="up">▼ Sinking</span>';
  }

  function setKpi(id, val, m, baseline, lowerIsBetter) {
    document.getElementById(id).textContent = val;
    const deltaEl = document.getElementById(id + "-delta");
    if (m === 0) { deltaEl.innerHTML = '<span class="down">Baseline</span>'; return; }
    const diff = val - baseline;
    const good = lowerIsBetter ? diff < 0 : diff > 0;
    const arrow = diff < 0 ? "▼" : diff > 0 ? "▲" : "—";
    deltaEl.innerHTML = '<span class="' + (good ? "up" : "down") + '">' + arrow + " " + Math.abs(diff) + " vs baseline</span>";
  }

  function initDashboard() {
    if (dashInit) return;
    dashInit = true;

    const slider = document.getElementById("month-slider");
    slider.addEventListener("input", () => renderMonth(+slider.value));

    document.getElementById("play-sim").addEventListener("click", () => {
      if (playTimer) { clearInterval(playTimer); playTimer = null; }
      slider.value = 0;
      renderMonth(0);
      let m = 0;
      playTimer = setInterval(() => {
        m++;
        slider.value = m;
        renderMonth(m);
        if (m >= 6) { clearInterval(playTimer); playTimer = null; }
      }, 900);
    });

    const alerts = document.getElementById("alert-list");
    SHIELD_SIM.alerts.forEach((a) => {
      const row = document.createElement("div");
      row.className = "alert-row";
      row.innerHTML = '<div class="alert-date">' + a.date + '</div><div class="alert-text">' + a.text + "</div>";
      alerts.appendChild(row);
    });

    renderMonth(0);
  }

  /* ---------------- Boot ---------------- */
  showView(location.hash.replace("#", "") || "audit");
})();
