(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function toast(message, type = "success") {
    let region = $(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "true");
      document.body.appendChild(region);
    }
    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = `<span class="toast-mark">${type === "error" ? "!" : "✓"}</span><span></span>`;
    $(".toast span:last-child", item).textContent = message;
    region.appendChild(item);
    window.setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateY(8px)";
      window.setTimeout(() => item.remove(), 250);
    }, 3200);
  }
  window.skillSwapToast = toast;

  // Add a compact theme control and mobile navigation without changing the original HTML.
  const nav = $(".nav");
  const navLinks = $(".nav-links");
  if (nav && navLinks) {
    const actions = document.createElement("div");
    actions.className = "nav-actions";
    actions.innerHTML = `
      <button class="theme-toggle" type="button" aria-label="Toggle dark mode" title="Toggle dark mode">☾</button>
      <button class="mobile-menu" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>`;
    const cta = $(".nav-cta", nav);
    if (cta) cta.parentNode.insertBefore(actions, cta);
    else nav.appendChild(actions);
    actions.querySelector(".theme-toggle").addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const dark = document.body.classList.contains("dark-mode");
      actions.querySelector(".theme-toggle").textContent = dark ? "☀" : "☾";
      localStorage.setItem("skillswap-theme", dark ? "dark" : "light");
      toast(`${dark ? "Dark" : "Light"} mode enabled`);
    });
    actions.querySelector(".mobile-menu").addEventListener("click", (event) => {
      const open = navLinks.classList.toggle("mobile-open");
      event.currentTarget.setAttribute("aria-expanded", String(open));
      event.currentTarget.textContent = open ? "×" : "☰";
    });
    if (localStorage.getItem("skillswap-theme") === "dark") {
      document.body.classList.add("dark-mode");
      actions.querySelector(".theme-toggle").textContent = "☀";
    }
    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        navLinks.classList.remove("mobile-open");
        const menu = $(".mobile-menu");
        if (menu) { menu.textContent = "☰"; menu.setAttribute("aria-expanded", "false"); }
      }
    });
  }

  // Page navigation with a safe fallback and accurate active state.
  window.showPage = function(id) {
    const target = document.getElementById("page-" + id);
    if (!target) return;
    $$(".page").forEach(page => page.classList.toggle("active", page === target));
    $$(".nav-links .nav-link").forEach(link => link.classList.remove("active"));
    const navButton = $$(".nav-links .nav-link").find(link => {
      const handler = link.getAttribute("onclick") || "";
      return handler.includes(`'${id}'`) || handler.includes(`"${id}"`);
    });
    if (navButton) navButton.classList.add("active");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    navLinks?.classList.remove("mobile-open");
    const menu = $(".mobile-menu");
    if (menu) { menu.textContent = "☰"; menu.setAttribute("aria-expanded", "false"); }
    observeReveals(target);
  };

  window.switchTab = function(tab) {
    const login = $("#auth-login"), register = $("#auth-register");
    if (!login || !register) return;
    login.style.display = tab === "login" ? "block" : "none";
    register.style.display = tab === "register" ? "block" : "none";
    $("#tab-login")?.classList.toggle("active", tab === "login");
    $("#tab-register")?.classList.toggle("active", tab === "register");
  };

  // Scroll reveal animations.
  let observer;
  function observeReveals(root = document) {
    const candidates = $$(".feature-card, .metric, .dash-card, .profile-section, .match-card, .stat-cell", root);
    if (!("IntersectionObserver" in window)) {
      candidates.forEach(el => el.classList.add("is-visible"));
      return;
    }
    if (!observer) observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    candidates.forEach((el, index) => {
      if (!el.classList.contains("reveal") && !el.classList.contains("is-visible")) {
        el.classList.add("reveal");
        el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      }
      observer.observe(el);
    });
  }
  observeReveals();

  // Search people and skills in the Explore page.
  const searchInput = $(".match-search-input");
  const matchCards = $$(".match-card");
  const resultText = $(".match-header div div:nth-child(2)");
  function filterMatches() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    let visible = 0;
    matchCards.forEach(card => {
      const match = card.textContent.toLowerCase().includes(term);
      card.style.display = match ? "" : "none";
      if (match) visible++;
    });
    if (resultText) resultText.textContent = `Showing ${visible} ${visible === 1 ? "match" : "matches"}${term ? ` for “${term}”` : ""}`;
  }
  searchInput?.addEventListener("input", filterMatches);
  const filterButton = $(".filter-btn");
  filterButton?.addEventListener("click", () => {
    const existing = $("#skill-filter-panel");
    if (existing) { existing.remove(); return; }
    const panel = document.createElement("div");
    panel.id = "skill-filter-panel";
    panel.style.cssText = "grid-column:1/-1;background:var(--white);border:1px solid var(--border);border-radius:14px;padding:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 18px";
    panel.innerHTML = `<strong style="font-size:13px;margin-right:5px">Quick filters:</strong>
      <button class="match-tag" data-filter="python">Python</button>
      <button class="match-tag" data-filter="design">Design</button>
      <button class="match-tag" data-filter="react">React</button>
      <button class="match-tag" data-filter="git">Git</button>
      <button class="match-tag" data-filter="">Clear</button>`;
    $(".match-header")?.insertAdjacentElement("afterend", panel);
    panel.addEventListener("click", e => {
      const button = e.target.closest("[data-filter]");
      if (!button) return;
      if (searchInput) searchInput.value = button.dataset.filter;
      filterMatches();
    });
  });

  // Make exchange requests, favorites, and profile actions respond clearly.
  $$(".mc-btn.primary, .btn-primary, .profile-edit-btn, .req-btn, .social-btn").forEach(button => {
    button.addEventListener("click", event => {
      if (button.matches(".mc-btn.primary")) {
        const card = button.closest(".match-card");
        const name = $(".match-card-name", card)?.textContent.trim() || "this member";
        const key = "skillswap-requests";
        const requests = JSON.parse(localStorage.getItem(key) || "[]");
        if (!requests.includes(name)) requests.push(name);
        localStorage.setItem(key, JSON.stringify(requests));
        button.textContent = "Request Sent ✓";
        button.disabled = true;
        button.style.opacity = ".78";
        toast(`Exchange request sent to ${name} (demo).`);
      } else if (button.classList.contains("profile-edit-btn")) {
        toast("Profile editing will be available when account storage is connected.");
      } else if (button.classList.contains("req-btn")) {
        const row = button.closest(".request-item");
        const person = $(".req-name", row)?.textContent || "Request";
        const accepted = button.classList.contains("accept");
        row?.remove();
        toast(`${person}: request ${accepted ? "accepted" : "passed"} (demo).`);
      } else if (button.classList.contains("social-btn")) {
        toast("Google sign-in needs Firebase or an OAuth backend.", "error");
      }
    });
  });
  $$(".mc-btn.secondary").forEach(button => button.addEventListener("click", () => {
    const card = button.closest(".match-card");
    const name = $(".match-card-name", card)?.textContent.trim() || "member";
    toast(`Profile preview for ${name} is a demo feature.`);
  }));

  // Demo-only form validation: never pretends to create a real account.
  $$(".form-submit").forEach(button => button.addEventListener("click", () => {
    const form = button.closest("#auth-login, #auth-register");
    if (!form) return;
    const inputs = $$("input", form);
    const empty = inputs.find(input => !input.value.trim());
    if (empty) {
      empty.focus();
      toast("Please complete all required fields.", "error");
      return;
    }
    const email = inputs.find(input => input.type === "email");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.focus();
      toast("Please enter a valid email address.", "error");
      return;
    }
    const password = inputs.find(input => input.type === "password" || input.dataset.pw);
    if (password && password.value.length < 8) {
      password.focus();
      toast("Password must contain at least 8 characters.", "error");
      return;
    }
    toast("Form validated. Connect Firebase/backend to enable real authentication.");
  }));

  // Keep demo statistics honest; remove fake claims from obvious static placeholders.
  const stats = $$(".stat-num");
  stats.forEach(el => {
    if (el.textContent.includes("8,400") || el.textContent.includes("1,240")) {
      el.title = "Illustrative demo data — replace with real platform statistics.";
    }
  });

  // ───── AI Match: rank members by two-way skill fit ─────
  const AI_MEMBERS = [
    { name: "Sadia Nushrat", initials: "SN", bg: "#EEF2FF", fg: "#4F46E5", loc: "Dhaka", rating: 4.8, offers: ["UI/UX Design", "Figma", "Prototyping"], wants: ["Python"], when: "Weekends" },
    { name: "Arif Khandaker", initials: "AK", bg: "#FEF9E1", fg: "#B45309", loc: "Chittagong", rating: 4.7, offers: ["Digital Marketing", "SEO", "Social Media"], wants: ["Django"], when: "Evenings" },
    { name: "Mithila Rahman", initials: "MR", bg: "#FCE7F3", fg: "#9D174D", loc: "Sylhet", rating: 5.0, offers: ["React", "TypeScript", "Next.js"], wants: ["FastAPI"], when: "Flexible" },
    { name: "Tanvir Islam", initials: "TI", bg: "#E1F5EE", fg: "#0D7377", loc: "Dhaka", rating: 4.6, offers: ["Video Editing", "Premiere Pro", "Motion"], wants: ["SQL"], when: "Weekdays" },
    { name: "Jannat Ara", initials: "JA", bg: "#EFF6FF", fg: "#1D4ED8", loc: "Rajshahi", rating: 4.9, offers: ["Content Writing", "Copywriting", "SEO Writing"], wants: ["Git & GitHub"], when: "Mornings" },
    { name: "Rezaul Hasan", initials: "RH", bg: "#F0FDF4", fg: "#15803D", loc: "Dhaka", rating: 4.5, offers: ["Photography", "Lightroom", "Portrait"], wants: ["Python"], when: "Weekends" },
    { name: "Maria Nushrat Mahia", initials: "MN", bg: "#FDF2F8", fg: "#BE185D", loc: "", rating: 0, offers: ["UI/UX Design"], wants: ["Python"], when: "" }
  ];
  const AI_ALIASES = {
    "ui": "ui/ux design", "ux": "ui/ux design", "ui/ux": "ui/ux design", "uiux": "ui/ux design", "ui ux": "ui/ux design",
    "ui design": "ui/ux design", "ux design": "ui/ux design", "py": "python", "js": "javascript", "ts": "typescript",
    "reactjs": "react", "react.js": "react", "nextjs": "next.js", "git": "git and github", "github": "git and github",
    "marketing": "digital marketing", "video": "video editing", "photo": "photography", "writing": "content writing",
    "rest api": "rest apis", "rest": "rest apis", "fast api": "fastapi"
  };
  const AI_GROUPS = [
    ["ui/ux design", "figma", "prototyping"],
    ["react", "typescript", "next.js", "javascript"],
    ["python", "django", "fastapi", "rest apis", "sql"],
    ["digital marketing", "seo", "social media", "content writing", "copywriting", "seo writing"],
    ["video editing", "premiere pro", "motion"],
    ["photography", "lightroom", "portrait"]
  ];
  const AI_STORE = "skillswap-ai-skills";
  const AI_MAX_SKILLS = 8;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const aiNorm = s => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9+#./ ]+/g, " ").replace(/\s+/g, " ").trim();
  const aiCanon = s => { const n = aiNorm(s); return AI_ALIASES[n] || n; };
  const aiSkill = label => ({ label, canon: aiCanon(label) });
  const aiList = items => items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  const aiUnique = items => [...new Set(items)];

  // 1 = same skill, 0.9 = one contains the other, 0.5 = same field, 0 = unrelated.
  function aiCredit(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const short = a.length <= b.length ? a : b;
    const long = short === a ? b : a;
    if (short.length >= 3 && ` ${long} `.includes(` ${short} `)) return 0.9;
    return AI_GROUPS.some(group => group.includes(a) && group.includes(b)) ? 0.5 : 0;
  }

  // want = skills the user listed, have = skills the member lists.
  function aiDirection(want, have) {
    if (!want.length) return null;
    const hits = want.map(w => {
      let best = { credit: 0, skill: "" };
      have.forEach(h => {
        const credit = aiCredit(w.canon, h.canon);
        if (credit > best.credit) best = { credit, skill: h.label };
      });
      return { user: w.label, credit: best.credit, skill: best.skill };
    });
    const credits = hits.map(h => h.credit);
    const best = Math.max(...credits);
    const avg = credits.reduce((a, b) => a + b, 0) / credits.length;
    return { score: 0.7 * best + 0.3 * avg, hits: hits.filter(h => h.credit > 0) };
  }

  function aiRank(teach, learn) {
    const t = teach.map(aiSkill), l = learn.map(aiSkill);
    return AI_MEMBERS.map(m => {
      const need = aiDirection(l, m.offers.map(aiSkill));   // what they can teach me
      const give = aiDirection(t, m.wants.map(aiSkill));    // what I can teach them
      const parts = [];
      if (need) parts.push([need.score, 0.55]);
      if (give) parts.push([give.score, 0.45]);
      const weight = parts.reduce((sum, p) => sum + p[1], 0);
      const fit = weight ? parts.reduce((sum, p) => sum + p[0] * p[1], 0) / weight : 0;
      const boosted = fit > 0 ? Math.min(1, fit + (m.rating ? (m.rating - 4.5) * 0.02 : 0)) : 0;
      return { m, need, give, pct: Math.round(boosted * 100) };
    }).filter(r => r.pct > 0).sort((a, b) => b.pct - a.pct || b.m.rating - a.m.rating);
  }

  const aiState = { teach: [], learn: [] };
  const aiResults = $("#ai-results");

  function aiSave() {
    try { localStorage.setItem(AI_STORE, JSON.stringify(aiState)); } catch (e) { /* storage unavailable */ }
  }

  function aiAdd(kind, raw) {
    const label = raw.trim().replace(/\s+/g, " ");
    if (!label) return false;
    const list = aiState[kind];
    if (list.some(s => aiCanon(s) === aiCanon(label))) { toast(`${label} is already in this list.`, "error"); return false; }
    if (list.length >= AI_MAX_SKILLS) { toast(`You can add up to ${AI_MAX_SKILLS} skills per list.`, "error"); return false; }
    list.push(label);
    return true;
  }

  function aiRenderChips(kind) {
    const box = $(`#ai-${kind}-chips`);
    if (!box) return;
    box.textContent = "";
    aiState[kind].forEach((skill, i) => {
      const chip = document.createElement("span");
      chip.className = `skill-pill ${kind}`;
      chip.append(document.createTextNode(skill));
      const x = document.createElement("button");
      x.type = "button";
      x.className = "ai-chip-x";
      x.dataset.index = i;
      x.setAttribute("aria-label", `Remove ${skill}`);
      x.textContent = "×";
      chip.appendChild(x);
      box.appendChild(chip);
    });
  }

  function aiRenderSuggest(kind) {
    const box = $(`#ai-${kind}-suggest`);
    if (!box) return;
    const pool = kind === "teach"
      ? aiUnique(AI_MEMBERS.flatMap(m => m.wants))
      : aiUnique(AI_MEMBERS.map(m => m.offers[0]));
    const taken = aiState[kind].map(aiCanon);
    const options = pool.filter(s => !taken.includes(aiCanon(s))).slice(0, 5);
    box.textContent = "";
    if (!options.length) return;
    box.append(document.createTextNode("Try:"));
    options.forEach(s => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.skill = s;
      b.textContent = s;
      box.appendChild(b);
    });
  }

  function aiMeter(label, score) {
    const pct = Math.round(score * 100);
    return `<div><div class="ai-meter-row"><span>${label}</span><span>${pct}%</span></div>
      <div class="ai-meter-track"><div class="ai-meter-fill" data-w="${pct}"></div></div></div>`;
  }

  function aiCard(r, i) {
    const m = r.m;
    const offered = r.need && r.need.hits.length ? aiUnique(r.need.hits.map(h => h.skill)) : [m.offers[0]];
    const wanted = r.give && r.give.hits.length ? aiUnique(r.give.hits.map(h => h.skill)) : [m.wants[0]];
    const shorten = list => list.slice(0, 2).join(" · ") + (list.length > 2 ? ` +${list.length - 2}` : "");
    const reasons = [];
    if (r.need && r.need.hits.length) {
      reasons.push(`Can teach you ${aiList(aiUnique(r.need.hits.map(h => h.credit === 1 ? h.skill : `${h.skill} (close to ${h.user})`)))}.`);
    }
    if (r.give && r.give.hits.length) {
      reasons.push(`Wants ${aiList(aiUnique(r.give.hits.map(h => h.credit === 1 ? h.skill : `${h.skill} (you teach ${h.user})`)))}, which you can teach.`);
    }
    const meters = [];
    if (r.need) meters.push(aiMeter("Teaches what you want", r.need.score));
    if (r.give) meters.push(aiMeter("Wants what you teach", r.give.score));
    const loc = m.loc ? `<i class="ti ti-map-pin" style="font-size:11px" aria-hidden="true"></i>${esc(m.loc)} · <span style="color:#F0A500">★</span> ${m.rating.toFixed(1)}` : "";
    return `<div class="match-card ai-card${i === 0 ? " top" : ""}" style="--i:${i}">
      <div class="match-card-top">
        <div class="match-card-avatar" style="background:${m.bg};color:${m.fg}">${esc(m.initials)}</div>
        <div>
          ${i === 0 ? '<span class="ai-badge">Best match</span>' : ""}
          <div class="match-card-name">${esc(m.name)}</div>
          <div class="match-card-loc">${loc}</div>
        </div>
        <div class="match-score"><div class="match-score-num">${r.pct}%</div><div class="match-score-label">match</div></div>
      </div>
      <div class="skill-exchange">
        <div class="skill-exchange-item"><div class="skill-exchange-type">Offers</div><div class="skill-exchange-name">${esc(shorten(offered))}</div></div>
        <div class="exchange-arrow">⇄</div>
        <div class="skill-exchange-item"><div class="skill-exchange-type">Wants</div><div class="skill-exchange-name">${esc(shorten(wanted))}</div></div>
      </div>
      <p class="ai-reason">${esc(reasons.join(" "))}</p>
      <div class="ai-meters">${meters.join("")}</div>
      ${m.when ? `<div class="match-tags"><span class="match-tag">${esc(m.when)}</span></div>` : ""}
      <div class="match-card-footer"><button class="mc-btn primary" type="button">Request Exchange</button><button class="mc-btn secondary" type="button">View Profile</button></div>
    </div>`;
  }

  function aiRender() {
    ["teach", "learn"].forEach(kind => { aiRenderChips(kind); aiRenderSuggest(kind); });
    if (!aiResults) return;
    if (!aiState.teach.length && !aiState.learn.length) {
      aiResults.innerHTML = '<div class="ai-empty">Add a skill you can teach or want to learn to see ranked matches.<br>You can also load the skills from your profile.</div>';
      return;
    }
    const ranked = aiRank(aiState.teach, aiState.learn);
    if (!ranked.length) {
      aiResults.innerHTML = '<div class="ai-empty">No members match these skills yet.<br>Try a broader skill such as Python or UI/UX Design.</div>';
      return;
    }
    aiResults.innerHTML = `<div class="ai-results-head">
        <div class="ai-results-title">${ranked.length} ${ranked.length === 1 ? "match" : "matches"} ranked by fit</div>
        <div class="ai-note">Scores combine two-way skill fit with a small boost for ratings.</div>
      </div>
      <div class="match-grid">${ranked.map(aiCard).join("")}</div>`;
    requestAnimationFrame(() => $$(".ai-meter-fill", aiResults).forEach(el => { el.style.width = `${el.dataset.w}%`; }));
  }

  function aiCommitPending() {
    ["teach", "learn"].forEach(kind => {
      const input = $(`#ai-${kind}-input`);
      if (input && input.value.trim()) { if (aiAdd(kind, input.value)) input.value = ""; }
    });
  }

  ["teach", "learn"].forEach(kind => {
    const input = $(`#ai-${kind}-input`);
    input?.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== ",") return;
      e.preventDefault();
      if (aiAdd(kind, input.value)) { input.value = ""; aiSave(); aiRender(); }
    });
    $(`#ai-${kind}-chips`)?.addEventListener("click", e => {
      const x = e.target.closest(".ai-chip-x");
      if (!x) return;
      aiState[kind].splice(Number(x.dataset.index), 1);
      aiSave(); aiRender();
    });
    $(`#ai-${kind}-suggest`)?.addEventListener("click", e => {
      const b = e.target.closest("button[data-skill]");
      if (b && aiAdd(kind, b.dataset.skill)) { aiSave(); aiRender(); }
    });
  });

  $("#ai-find")?.addEventListener("click", () => {
    aiCommitPending();
    aiSave(); aiRender();
    if (!aiState.teach.length && !aiState.learn.length) { toast("Add at least one skill first.", "error"); return; }
    aiResults?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#ai-use-profile")?.addEventListener("click", () => {
    const read = kind => aiUnique($$(`#page-profile .skill-pill.${kind}`).map(el => el.textContent.replace(/\s+/g, " ").trim())).slice(0, AI_MAX_SKILLS);
    aiState.teach = read("teach");
    aiState.learn = read("learn");
    aiSave(); aiRender();
    toast("Loaded the skills from your profile.");
  });

  $("#ai-clear")?.addEventListener("click", () => {
    aiState.teach = []; aiState.learn = [];
    aiSave(); aiRender();
  });

  aiResults?.addEventListener("click", e => {
    const button = e.target.closest(".mc-btn");
    if (!button) return;
    const name = $(".match-card-name", button.closest(".match-card"))?.textContent.trim() || "this member";
    if (button.classList.contains("primary")) {
      try {
        const requests = JSON.parse(localStorage.getItem("skillswap-requests") || "[]");
        if (!requests.includes(name)) requests.push(name);
        localStorage.setItem("skillswap-requests", JSON.stringify(requests));
      } catch (err) { /* storage unavailable */ }
      button.textContent = "Request Sent ✓";
      button.disabled = true;
      button.style.opacity = ".78";
      toast(`Exchange request sent to ${name} (demo).`);
    } else {
      toast(`Profile preview for ${name} is a demo feature.`);
    }
  });

  try {
    const saved = JSON.parse(localStorage.getItem(AI_STORE) || "null");
    if (saved) ["teach", "learn"].forEach(kind => {
      if (Array.isArray(saved[kind])) aiState[kind] = saved[kind].filter(s => typeof s === "string").slice(0, AI_MAX_SKILLS);
    });
  } catch (e) { /* ignore corrupt data */ }
  aiRender();

  // ───── Visual layer: skill-network background, cursor, card effects ─────
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = { x: -999, y: -999 };
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const FX = ".feature-card,.metric,.match-card,.cm-card,.dash-card,.profile-section";
  const TILT = ".feature-card,.metric,.match-card,.cm-card";

  (function network() {
    const c = document.createElement("canvas");
    c.id = "bg-net";
    c.setAttribute("aria-hidden", "true");
    document.body.prepend(c);
    const g = c.getContext("2d");
    if (!g) return;
    const words = ["Python", "Figma", "React", "SQL", "Git", "Design", "Django", "SEO", "Video", "Writing", "Excel", "UI/UX"];
    let W, H, nodes = [], pulses = [], raf;
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(56, Math.max(18, W * H / 26000)));
      nodes = Array.from({ length: n }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: 1.6 + Math.random() * 1.6, w: i % 4 === 0 ? words[(i / 4) % words.length] : "" }));
    }
    function frame() {
      g.clearRect(0, 0, W, H);
      const rgb = document.body.classList.contains("dark-mode") ? "115,223,208" : "13,115,119";
      if (!calm) nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
        if (d < 170 && d > 1) { n.x += dx / d * .5; n.y += dy / d * .5; }
      });
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= 150) continue;
          g.strokeStyle = `rgba(${rgb},${(1 - d / 150) * .2})`;
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
          if (!calm && pulses.length < 8 && Math.random() < .0008) pulses.push({ a, b, t: 0 });
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 170) {
          g.strokeStyle = `rgba(20,189,172,${(1 - md / 170) * .55})`;
          g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(mouse.x, mouse.y); g.stroke();
        }
        g.fillStyle = `rgba(${rgb},.45)`;
        g.beginPath(); g.arc(a.x, a.y, a.r, 0, 6.283); g.fill();
        if (a.w) { g.font = "500 11px 'DM Sans',sans-serif"; g.fillStyle = `rgba(${rgb},.38)`; g.fillText(a.w, a.x + 7, a.y + 4); }
      }
      pulses = pulses.filter(p => (p.t += .012) < 1);
      pulses.forEach(p => {
        g.fillStyle = "rgba(240,165,0,.9)";
        g.beginPath(); g.arc(p.a.x + (p.b.x - p.a.x) * p.t, p.a.y + (p.b.y - p.a.y) * p.t, 2.6, 0, 6.283); g.fill();
      });
    }
    function loop() { frame(); if (!calm && !document.hidden) raf = requestAnimationFrame(loop); }
    size(); loop();
    addEventListener("resize", () => { size(); if (calm) frame(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && !calm) { cancelAnimationFrame(raf); loop(); } });
  })();

  if (canHover && !calm) (function cursor() {
    const mk = cls => { const d = document.createElement("div"); d.className = cls; document.body.appendChild(d); return d; };
    const dot = mk("cur-dot"), ring = mk("cur-ring");
    let rx = -99, ry = -99;
    document.body.classList.add("cur-on");
    (function tick() {
      rx += (mouse.x - rx) * .18; ry += (mouse.y - ry) * .18;
      dot.style.transform = `translate3d(${mouse.x}px,${mouse.y}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(tick);
    })();
    document.addEventListener("pointerover", e => {
      const t = e.target;
      ring.className = "cur-ring" + (t.closest("input,textarea") ? " text" : t.closest("a,button,.nav-link,[onclick]") ? " link" : t.closest(FX) ? " card" : "");
    });
    document.addEventListener("pointerdown", e => {
      const r = mk("cur-ripple");
      r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
      setTimeout(() => r.remove(), 600);
    });
    document.addEventListener("mouseout", e => { if (!e.relatedTarget) dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener("mouseover", () => { dot.style.opacity = ring.style.opacity = ""; });
  })();

  if (canHover) {
    let hot = null;
    document.addEventListener("pointermove", e => {
      const card = e.target.closest(FX);
      if (hot && hot !== card) { hot.style.transform = ""; hot = null; }
      if (!card) return;
      const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      if (calm || !card.matches(TILT)) return;
      card.style.transitionDelay = "0ms";
      hot = card;
      card.style.transform = `perspective(900px) rotateX(${((.5 - y / r.height) * 7).toFixed(2)}deg) rotateY(${((x / r.width - .5) * 9).toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });
  }

  // Login: show/hide password and a strength meter on the register form.
  $$("#page-auth input[type=password]").forEach(input => {
    input.dataset.pw = "1";
    const wrap = document.createElement("div");
    wrap.className = "pw-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const eye = document.createElement("button");
    eye.type = "button"; eye.className = "pw-eye"; eye.textContent = "Show";
    eye.setAttribute("aria-label", "Show password");
    eye.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      eye.textContent = show ? "Hide" : "Show";
      eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
    wrap.appendChild(eye);
    if (input.closest("#auth-register")) {
      const meter = document.createElement("div");
      meter.className = "pw-meter"; meter.dataset.l = 0;
      meter.innerHTML = "<i></i><i></i><i></i><i></i>";
      wrap.after(meter);
      input.addEventListener("input", () => {
        const v = input.value;
        meter.dataset.l = (v.length >= 8) + (/[A-Z]/.test(v) && /[a-z]/.test(v)) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v);
      });
    }
  });

  // Community page: top swappers (illustrative demo data).
  const COMMUNITY = [
    { n: "Mithila Rahman", field: "Code", swaps: 51 }, { n: "Sadia Nushrat", field: "Design", swaps: 42 },
    { n: "Arif Khandaker", field: "Marketing", swaps: 37 }, { n: "Jannat Ara", field: "Marketing", swaps: 33 },
    { n: "Tanvir Islam", field: "Media", swaps: 29 }, { n: "Rezaul Hasan", field: "Media", swaps: 24 },
    { n: "Maria Nushrat Mahia", field: "Design", swaps: 19 }
  ];
  const cmGrid = $("#cm-grid"), cmBar = $("#cm-filters");
  let cmField = "All";
  function countUp(el) {
    const end = Number(el.dataset.count);
    if (calm) { el.textContent = end; return; }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 900);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function cmRender() {
    if (!cmGrid || !cmBar) return;
    cmBar.innerHTML = ["All", "Design", "Code", "Marketing", "Media"].map(f => `<button type="button" class="${f === cmField ? "on" : ""}" data-f="${f}">${f}</button>`).join("");
    cmGrid.innerHTML = COMMUNITY.filter(c => cmField === "All" || c.field === cmField).map((c, i) => {
      const m = AI_MEMBERS.find(x => x.name === c.n);
      return `<div class="cm-card" style="--i:${i}"><span class="cm-rank">${i + 1}</span>
        <div class="match-card-top"><div class="match-card-avatar" style="background:${m.bg};color:${m.fg}">${m.initials}</div>
          <div><div class="match-card-name">${m.name}</div><div class="match-card-loc">${m.loc || "SkillSwap member"}${m.rating ? ` · <span style="color:#F0A500">★</span> ${m.rating.toFixed(1)}` : ""}</div></div></div>
        <div class="cm-stats"><div class="cm-stat"><b data-count="${c.swaps}">0</b><span>swaps done</span></div><div class="cm-stat"><b>${c.field}</b><span>field</span></div></div>
        <div>${m.offers.map(s => `<span class="skill-pill teach">${s}</span>`).join("")}</div></div>`;
    }).join("");
    $$("[data-count]", cmGrid).forEach(countUp);
  }
  cmBar?.addEventListener("click", e => {
    const b = e.target.closest("[data-f]");
    if (b) { cmField = b.dataset.f; cmRender(); }
  });
  cmRender();
})();
