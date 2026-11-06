<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=0:0D7377,50:14BDAC,100:0D7377&text=SkillSwap&fontColor=ffffff&fontSize=42&animation=fadeIn"/>
</p>

<p align="center">
  <b>A peer-to-peer skill exchange platform</b> — trade what you know for what you want to learn.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-100%25-E34F26?style=flat-square&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/status-prototype-F0A500?style=flat-square"/>
  <img src="https://img.shields.io/badge/license-MIT-14BDAC?style=flat-square"/>
</p>

---

## 📖 About

**SkillSwap** is a front-end prototype for a skill-exchange platform — a place where people teach what they're good at in exchange for learning something new, instead of paying for it. No money changes hands; skills are the currency.

This repo contains a fully interactive, dependency-free HTML/CSS/JS prototype covering the core product experience: landing page, dashboard, user profiles, skill matching, an AI Match page, and a community leaderboard.

## ✨ Features

- 🏠 **Landing page** — product pitch, feature highlights, and platform stats
- 📊 **Dashboard** — at-a-glance metrics, incoming skill requests (accept/decline), and upcoming sessions
- 👤 **Profile page** — bio, skills to teach vs. skills to learn, and peer ratings/reviews
- 🔍 **Explore** — searchable, filterable skill-matching grid with a compatibility score for each potential match
- 🤖 **AI Match** — enter the skills you can teach and the skills you want to learn, and get members ranked by two-way fit, with a score, a breakdown, and a short reason for each match
- 🏆 **Community** — a leaderboard of top swappers with field filters and animated counters
- 🔐 **Sign in / Register** — redesigned auth screen with a sliding tab switch, show/hide password, a password-strength meter, and form validation
- 🌗 **Dark mode** — one-click theme toggle, remembered between visits
- 🎨 **Interactive visual layer** — animated skill-network background that reacts to the cursor, a custom cursor, and cards with a spotlight and 3D tilt effect
- 📱 **Responsive** — mobile navigation menu and layouts that adapt to small screens

## 🤖 How AI Match Works

AI Match is a **rule-based scoring engine that runs in the browser**, not a machine-learning model.

1. Skills are normalized (for example, `ux`, `UI` and `ui/ux` all map to *UI/UX Design*).
2. Each skill pair gets a similarity credit: the same skill scores highest, a related skill in the same field scores partial credit.
3. Two directions are scored: *what the member can teach you* and *what you can teach them*.
4. The final score blends both directions, with a small boost for higher-rated members.

Your skills and sent requests are saved in `localStorage`, so they survive a page refresh.

## 🛠 Built With

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,css,js"/>
</p>

- **HTML5** — page structure & multi-view app shell
- **CSS3** — custom design tokens (CSS variables), grid/flex layouts, keyframe animations, no external CSS framework
- **Vanilla JavaScript** — page/view switching, matching logic, canvas background, custom cursor, interactivity
- **Google Fonts** — DM Sans & DM Serif Display
- **Tabler Icons** — icon font loaded from a CDN

## 📁 Project Structure

```
SkillSwapp/
├── index.html   # all pages (landing, dashboard, profile, explore, AI Match, community, auth)
├── style.css    # design tokens, layouts, dark mode, animations
├── script.js    # navigation, matching engine, background, cursor, card effects
└── README.md
```

## 🚀 Getting Started

This is a static, dependency-free prototype — no build step required.

```bash
git clone https://github.com/mdmirajhossansajid/SkillSwapp.git
cd SkillSwapp
```

Then just open `index.html` in your browser, or serve it locally:

```bash
# using Python
python -m http.server 8000

# or using VS Code Live Server extension
```

## 📌 Project Status

This is a **UI/UX prototype** built to demonstrate the product concept and core user flows. It's not yet connected to a backend. Member data, community figures, and platform statistics are illustrative demo data, and sign-in only validates the form without creating a real account.

The custom cursor and card tilt are enabled only on devices with a mouse, and animations are reduced for users who prefer reduced motion.

**Planned next steps:**
- [ ] Backend & database for real user accounts and skill listings
- [ ] Authentication & session persistence
- [ ] Move matching to the backend so it runs on real member data
- [ ] Request tracker with status updates on the dashboard
- [ ] Real-time messaging between matched users
- [ ] Ratings & reviews after a completed exchange
- [ ] live -link:https://mdmirajhossansajid.github.io/SkillSwapp/
      

## 👤 Author

**Md Miraj Hossan Sajid**
CSE Undergraduate, Southeast University, Dhaka

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mdmirajhossansajid/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/mdmirajhossansajid)

---

<p align="center">⭐ If you like this project, consider giving it a star!</p>
