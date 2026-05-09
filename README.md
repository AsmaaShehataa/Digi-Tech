# Digi-Tech — Global Software Engineering Services Website

A modern, minimalist, and multilingual professional website showcasing software engineering services focused on:

- Web and mobile application design & development
- Digital transformation initiatives
- AI product integration and UX modernization

The site is designed for a seamless user experience, global accessibility, and straightforward deployment to reliable hosting platforms.

## Project Structure

- `index.html` — Semantic page layout and content sections
- `styles.css` — Responsive, minimalist visual design system
- `script.js` — Multilingual UI + AI-style recommendation interaction
- `admin_backend.py` — Flask + SQLite backend for admin route and APIs
- `templates/admin_dashboard.html` — Admin dashboard UI
- `static/admin.css` — Admin dashboard styling
- `static/admin.js` — Admin dashboard client logic
- `docs/admin-dashboard.md` — Architecture, schema, and route documentation

## Included Features

### 1) Modern, user-friendly design

- Clean dark-theme aesthetic with strong readability
- Responsive layout for desktop, tablet, and mobile
- Clear content hierarchy and conversion-focused CTAs

### 2) AI-driven experience

- Interactive recommendation assistant that suggests service pathways based on visitor inputs
- Personalized output model to guide users toward relevant engagement options

### 3) Multilingual support

- Built-in language switching for:
  - English (`en`)
  - Spanish (`es`)
  - French (`fr`)
  - Arabic (`ar`, RTL supported)
- Client-side translation dictionary architecture that can be extended easily

### 4) Accessibility foundation

- Semantic landmarks (`header`, `main`, `section`, `footer`)
- Skip link for keyboard users
- Focus-visible states and keyboard-friendly controls
- RTL-aware layout behavior for Arabic

### 5) Reliable hosting readiness

This website is static and can be deployed globally with high reliability on platforms such as:

- **Cloudflare Pages**
- **Netlify**
- **Vercel**
- **AWS S3 + CloudFront**

Recommended production setup:

- Global CDN enabled
- HTTPS (SSL/TLS) enforced
- Caching headers configured
- Monitoring and uptime alerts enabled

## Run Locally

### Public website (static only)

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

### Admin dashboard (with database + API)

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Run backend:

```bash
python3 admin_backend.py
```

Then open:

- `http://localhost:5000/` (website)
- `http://localhost:5000/admin` (admin dashboard)

SQLite database is auto-created at:

- `data/admin_dashboard.db`

Admin dashboard supports manual project entry with automated calculations and now includes:

- project-level currency selection (`USD` or `EGP`)
- currency-filtered overview cards and project table
- currency-aware CSV/JSON exports and share-report drafts

## Customization Notes

- Replace `Digi-Tech` branding and copy in `index.html`
- Update contact email in the contact CTA (`mailto:` link)
- Add more languages by extending the `translations` object in `script.js`
- Integrate analytics (e.g., Plausible, GA4) and form backend if needed

## Next Production Enhancements (Optional)

- Connect contact form to CRM/email automation
- Add case studies and testimonials
- Add CMS-backed localization workflow
- Add structured data (JSON-LD) for SEO
