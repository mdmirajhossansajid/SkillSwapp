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
    const password = inputs.find(input => input.type === "password");
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
})();
