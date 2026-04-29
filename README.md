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

Because this is a static site, you can run it with any simple HTTP server:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

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
