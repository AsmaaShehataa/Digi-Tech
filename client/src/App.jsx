import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Compass,
  Cpu,
  ExternalLink,
  Layout,
  PenTool,
  Plane,
  Receipt,
  Rocket,
  Smartphone,
  Stethoscope,
} from "lucide-react";
import "./App.css";

const currencyFormatter = (currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

const formatCurrency = (amount, currency = "USD") => currencyFormatter(currency).format(Number(amount || 0));

const WebProductVisual = () => (
  <div className="service-visual web-mock" aria-hidden="true">
    <svg viewBox="0 0 380 220" className="mock-svg" role="img">
      <defs>
        <linearGradient id="webDeskGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="webPhoneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="chartBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <clipPath id="phoneScreenClip">
          <rect x="252" y="52" width="84" height="132" rx="10" />
        </clipPath>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <rect width="380" height="220" rx="18" fill="rgba(59,130,246,0.05)" />

      {/* Browser / desktop window */}
      <g filter="url(#softShadow)">
        <rect x="18" y="22" width="240" height="168" rx="14" fill="url(#webDeskGrad)" stroke="#334155" />
        {/* title bar */}
        <rect x="18" y="22" width="240" height="30" rx="14" fill="#111827" />
        <rect x="18" y="40" width="240" height="12" fill="#111827" />
        <circle cx="38" cy="37" r="4" fill="#f87171" />
        <circle cx="52" cy="37" r="4" fill="#fbbf24" />
        <circle cx="66" cy="37" r="4" fill="#34d399" />
        {/* URL bar */}
        <rect x="84" y="30" width="152" height="16" rx="8" fill="#0b1220" stroke="#334155" />
        <circle cx="94" cy="38" r="3" fill="#22c55e" />
        <text x="102" y="42" fill="#94a3b8" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          digi-tech.app/dashboard
        </text>
        {/* sidebar */}
        <rect x="28" y="60" width="52" height="118" rx="8" fill="#0b1220" />
        <rect x="36" y="70" width="36" height="6" rx="3" fill="#3b82f6" />
        <rect x="36" y="84" width="28" height="5" rx="2.5" fill="#334155" />
        <rect x="36" y="96" width="32" height="5" rx="2.5" fill="#334155" />
        <rect x="36" y="108" width="24" height="5" rx="2.5" fill="#334155" />
        <text x="36" y="158" fill="#64748b" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Studio
        </text>
        {/* main panel */}
        <text x="92" y="74" fill="#e2e8f0" fontSize="10" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Revenue overview
        </text>
        <text x="92" y="88" fill="#64748b" fontSize="7.5" fontFamily="Inter, system-ui, sans-serif">
          Last 7 days · +18.4%
        </text>
        {/* mini cards */}
        <rect x="92" y="96" width="70" height="34" rx="8" fill="#0b1220" stroke="#1e293b" />
        <text x="100" y="110" fill="#94a3b8" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Active users
        </text>
        <text x="100" y="122" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          12.4k
        </text>
        <rect x="170" y="96" width="70" height="34" rx="8" fill="#0b1220" stroke="#1e293b" />
        <text x="178" y="110" fill="#94a3b8" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Conversion
        </text>
        <text x="178" y="122" fill="#34d399" fontSize="11" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          4.8%
        </text>
        {/* chart bars */}
        <rect x="96" y="158" width="10" height="18" rx="3" fill="url(#chartBar)" opacity="0.55" />
        <rect x="112" y="148" width="10" height="28" rx="3" fill="url(#chartBar)" opacity="0.7" />
        <rect x="128" y="140" width="10" height="36" rx="3" fill="url(#chartBar)" />
        <rect x="144" y="150" width="10" height="26" rx="3" fill="url(#chartBar)" opacity="0.75" />
        <rect x="160" y="136" width="10" height="40" rx="3" fill="url(#chartBar)" />
        <rect x="176" y="144" width="10" height="32" rx="3" fill="url(#chartBar)" opacity="0.85" />
        <rect x="192" y="130" width="10" height="46" rx="3" fill="url(#chartBar)" />
        <rect x="208" y="142" width="10" height="34" rx="3" fill="url(#chartBar)" opacity="0.7" />
        <text x="92" y="184" fill="#475569" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Mon  Tue  Wed  Thu  Fri  Sat  Sun
        </text>
      </g>

      {/* Phone with app UI */}
      <g filter="url(#softShadow)">
        <rect x="246" y="40" width="96" height="156" rx="18" fill="#0f172a" stroke="#64748b" strokeWidth="3" />
        <rect x="252" y="52" width="84" height="132" rx="10" fill="url(#webPhoneGrad)" />
        <g clipPath="url(#phoneScreenClip)">
          <rect x="252" y="52" width="84" height="22" fill="#000" fillOpacity="0.18" />
          <text x="262" y="66" fill="#fff" fontSize="8" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            9:41
          </text>
          <text x="264" y="86" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
            Digi Pulse
          </text>
          <text x="264" y="98" fill="#e0e7ff" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            Today&apos;s highlights
          </text>
          <rect x="264" y="106" width="60" height="28" rx="8" fill="#fff" fillOpacity="0.18" />
          <text x="272" y="118" fill="#fff" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            New leads
          </text>
          <text x="272" y="129" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
            +126
          </text>
          <rect x="264" y="140" width="28" height="22" rx="7" fill="#fff" fillOpacity="0.16" />
          <rect x="296" y="140" width="28" height="22" rx="7" fill="#fff" fillOpacity="0.16" />
          <text x="270" y="154" fill="#fff" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            UX
          </text>
          <text x="302" y="154" fill="#fff" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            AI
          </text>
          <rect x="274" y="172" width="40" height="4" rx="2" fill="#fff" fillOpacity="0.35" />
        </g>
      </g>
    </svg>
  </div>
);

const MobileAppsVisual = () => (
  <div className="service-visual mobile-mock" aria-hidden="true">
    <svg viewBox="0 0 240 220" className="mock-svg" role="img">
      <defs>
        <linearGradient id="phoneA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="phoneB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="45%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <clipPath id="clipPhoneA">
          <rect x="6" y="14" width="72" height="132" rx="10" />
        </clipPath>
        <clipPath id="clipPhoneB">
          <rect x="6" y="14" width="72" height="132" rx="10" />
        </clipPath>
        <filter id="phoneShadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      <rect width="240" height="220" rx="18" fill="rgba(168,85,247,0.05)" />

      {/* Left phone — fitness / analytics style */}
      <g filter="url(#phoneShadow)" transform="translate(30 28) rotate(-11 42 80)">
        <rect width="84" height="160" rx="16" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
        <rect x="6" y="14" width="72" height="132" rx="10" fill="url(#phoneA)" />
        <g clipPath="url(#clipPhoneA)">
          <text x="14" y="28" fill="#fff" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            9:41
          </text>
          <text x="14" y="46" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
            Activity
          </text>
          <text x="14" y="58" fill="#dbeafe" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            Weekly goal
          </text>
          <circle cx="42" cy="92" r="22" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="5" />
          <circle
            cx="42"
            cy="92"
            r="22"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeDasharray="90 140"
            strokeLinecap="round"
            transform="rotate(-90 42 92)"
          />
          <text x="34" y="90" fill="#fff" fontSize="10" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
            78%
          </text>
          <text x="30" y="102" fill="#dbeafe" fontSize="6" fontFamily="Inter, system-ui, sans-serif">
            done
          </text>
          <rect x="14" y="124" width="56" height="14" rx="7" fill="#fff" fillOpacity="0.2" />
          <text x="26" y="134" fill="#fff" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            Open app
          </text>
        </g>
      </g>

      {/* Right phone — commerce / feed style */}
      <g filter="url(#phoneShadow)" transform="translate(118 36) rotate(9 42 80)">
        <rect width="84" height="160" rx="16" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
        <rect x="6" y="14" width="72" height="132" rx="10" fill="url(#phoneB)" />
        <g clipPath="url(#clipPhoneB)">
          <text x="14" y="28" fill="#fff" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            9:41
          </text>
          <text x="14" y="46" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
            Shop
          </text>
          <rect x="14" y="54" width="56" height="10" rx="5" fill="#fff" fillOpacity="0.18" />
          <text x="20" y="61.5" fill="#f5d0fe" fontSize="6" fontFamily="Inter, system-ui, sans-serif">
            Search products
          </text>
          <rect x="14" y="72" width="56" height="28" rx="8" fill="#fff" fillOpacity="0.16" />
          <text x="20" y="84" fill="#fff" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
            Neon Jacket
          </text>
          <text x="20" y="94" fill="#f5d0fe" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
            $128 · 4.9★
          </text>
          <rect x="14" y="106" width="26" height="22" rx="7" fill="#fff" fillOpacity="0.18" />
          <rect x="44" y="106" width="26" height="22" rx="7" fill="#fff" fillOpacity="0.18" />
          <text x="20" y="120" fill="#fff" fontSize="6" fontFamily="Inter, system-ui, sans-serif">
            New
          </text>
          <text x="50" y="120" fill="#fff" fontSize="6" fontFamily="Inter, system-ui, sans-serif">
            Sale
          </text>
          <rect x="22" y="136" width="12" height="3" rx="1.5" fill="#fff" fillOpacity="0.5" />
          <rect x="38" y="136" width="12" height="3" rx="1.5" fill="#fff" fillOpacity="0.25" />
          <rect x="54" y="136" width="12" height="3" rx="1.5" fill="#fff" fillOpacity="0.25" />
        </g>
      </g>
    </svg>
  </div>
);

const AiNetworkVisual = () => (
  <div className="service-visual ai-mock" aria-hidden="true">
    <svg viewBox="0 0 220 160" className="mock-svg" role="img">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="220" height="160" rx="18" fill="rgba(59,130,246,0.05)" />
      <circle cx="110" cy="80" r="54" fill="url(#nodeGlow)" />
      <g stroke="url(#edgeGrad)" strokeWidth="1.6" fill="none" opacity="0.85">
        <line x1="110" y1="80" x2="48" y2="42" />
        <line x1="110" y1="80" x2="170" y2="36" />
        <line x1="110" y1="80" x2="178" y2="108" />
        <line x1="110" y1="80" x2="52" y2="118" />
        <line x1="48" y1="42" x2="170" y2="36" />
        <line x1="178" y1="108" x2="52" y2="118" />
      </g>
      <circle cx="110" cy="80" r="12" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" />
      <circle cx="48" cy="42" r="7" fill="#60a5fa" />
      <circle cx="170" cy="36" r="7" fill="#a78bfa" />
      <circle cx="178" cy="108" r="7" fill="#38bdf8" />
      <circle cx="52" cy="118" r="7" fill="#818cf8" />
      <circle cx="146" cy="72" r="4.5" fill="#c4b5fd" />
      <circle cx="78" cy="58" r="4" fill="#93c5fd" />
    </svg>
  </div>
);

const TravelPortfolioVisual = () => (
  <div className="portfolio-visual" aria-hidden="true">
    <svg viewBox="0 0 420 240" className="mock-svg" role="img">
      <defs>
        <linearGradient id="travelSky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#134e4a" />
        </linearGradient>
        <linearGradient id="travelCard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" rx="18" fill="url(#travelSky)" />
      <circle cx="340" cy="48" r="28" fill="#fde68a" fillOpacity="0.85" />
      <path d="M40 168 C120 120, 220 190, 390 140" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <g transform="translate(28 28)">
        <rect width="250" height="184" rx="14" fill="#0b1220" fillOpacity="0.55" stroke="#7dd3fc" strokeOpacity="0.35" />
        <text x="18" y="28" fill="#e0f2fe" fontSize="11" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Al-Fairuz Travel
        </text>
        <text x="18" y="44" fill="#bae6fd" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Buses · Bundles · Locations
        </text>
        <rect x="18" y="58" width="214" height="48" rx="10" fill="url(#travelCard)" />
        <text x="30" y="78" fill="#0c4a6e" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Cairo → Alexandria
        </text>
        <text x="30" y="94" fill="#0369a1" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Depart 08:30 · From 180 EGP
        </text>
        <rect x="18" y="118" width="100" height="46" rx="10" fill="#082f49" />
        <text x="28" y="138" fill="#7dd3fc" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Destinations
        </text>
        <text x="28" y="152" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          24+
        </text>
        <rect x="132" y="118" width="100" height="46" rx="10" fill="#082f49" />
        <text x="142" y="138" fill="#7dd3fc" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Live booking
        </text>
        <text x="142" y="152" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Online
        </text>
      </g>
      <g transform="translate(300 70)">
        <rect width="92" height="140" rx="16" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
        <rect x="7" y="12" width="78" height="116" rx="10" fill="#0369a1" />
        <text x="18" y="34" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          My Trip
        </text>
        <rect x="16" y="44" width="60" height="28" rx="8" fill="#fff" fillOpacity="0.18" />
        <text x="22" y="62" fill="#e0f2fe" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Seat 14A
        </text>
        <rect x="16" y="82" width="60" height="10" rx="5" fill="#fff" fillOpacity="0.2" />
        <rect x="16" y="98" width="44" height="10" rx="5" fill="#fff" fillOpacity="0.14" />
      </g>
    </svg>
  </div>
);

const VetPortfolioVisual = () => (
  <div className="portfolio-visual" aria-hidden="true">
    <svg viewBox="0 0 420 240" className="mock-svg" role="img">
      <defs>
        <linearGradient id="vetBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14532d" />
          <stop offset="50%" stopColor="#166534" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" rx="18" fill="url(#vetBg)" />
      <circle cx="360" cy="40" r="50" fill="#22c55e" fillOpacity="0.12" />
      <g transform="translate(24 24)">
        <rect width="372" height="192" rx="14" fill="#052e16" fillOpacity="0.55" stroke="#4ade80" strokeOpacity="0.3" />
        <text x="20" y="30" fill="#dcfce7" fontSize="12" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Digital Vet · Poultry Disease Guide
        </text>
        <text x="20" y="48" fill="#86efac" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Clinical reference for farms &amp; veterinarians
        </text>
        <rect x="20" y="64" width="160" height="100" rx="12" fill="#14532d" stroke="#22c55e" strokeOpacity="0.35" />
        <text x="34" y="88" fill="#bbf7d0" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Symptom search
        </text>
        <rect x="34" y="98" width="132" height="14" rx="7" fill="#052e16" />
        <text x="42" y="108" fill="#86efac" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          respiratory · flock age
        </text>
        <rect x="34" y="124" width="60" height="22" rx="8" fill="#22c55e" />
        <text x="46" y="138" fill="#052e16" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Diagnose
        </text>
        <rect x="198" y="64" width="154" height="46" rx="10" fill="#166534" />
        <text x="212" y="84" fill="#bbf7d0" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Disease library
        </text>
        <text x="212" y="100" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          120+ entries
        </text>
        <rect x="198" y="120" width="154" height="44" rx="10" fill="#166534" />
        <text x="212" y="140" fill="#bbf7d0" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Field-ready
        </text>
        <text x="212" y="156" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Mobile + web
        </text>
      </g>
    </svg>
  </div>
);

const InvoicePortfolioVisual = () => (
  <div className="portfolio-visual" aria-hidden="true">
    <svg viewBox="0 0 420 240" className="mock-svg" role="img">
      <defs>
        <linearGradient id="invoiceBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="invoiceAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" rx="18" fill="url(#invoiceBg)" />
      <g transform="translate(22 22)">
        <rect width="248" height="196" rx="12" fill="#0f172a" stroke="#6366f1" strokeOpacity="0.4" />
        <rect x="0" y="0" width="248" height="34" rx="12" fill="#1e1b4b" />
        <rect x="0" y="22" width="248" height="12" fill="#1e1b4b" />
        <text x="16" y="22" fill="#e0e7ff" fontSize="10" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Invoice #INV-2048
        </text>
        <text x="16" y="54" fill="#a5b4fc" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Client · Nile Commerce LLC
        </text>
        <text x="16" y="72" fill="#fff" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
          EGP 48,920.00
        </text>
        <rect x="16" y="86" width="72" height="18" rx="9" fill="url(#invoiceAccent)" />
        <text x="28" y="98" fill="#1e1b4b" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Paid
        </text>
        <rect x="16" y="118" width="216" height="1" fill="#312e81" />
        <text x="16" y="138" fill="#94a3b8" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Design sprint
        </text>
        <text x="190" y="138" fill="#e2e8f0" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          12,000
        </text>
        <text x="16" y="156" fill="#94a3b8" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          API integration
        </text>
        <text x="190" y="156" fill="#e2e8f0" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          18,500
        </text>
        <text x="16" y="174" fill="#94a3b8" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          Support retainer
        </text>
        <text x="190" y="174" fill="#e2e8f0" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
          18,420
        </text>
      </g>
      <g transform="translate(290 48)">
        <rect width="108" height="150" rx="12" fill="#0f172a" stroke="#a78bfa" strokeOpacity="0.45" />
        <text x="14" y="28" fill="#ddd6fe" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Cashflow
        </text>
        <rect x="16" y="110" width="14" height="28" rx="3" fill="#818cf8" />
        <rect x="36" y="96" width="14" height="42" rx="3" fill="#a78bfa" />
        <rect x="56" y="84" width="14" height="54" rx="3" fill="#c084fc" />
        <rect x="76" y="74" width="14" height="64" rx="3" fill="#e879f9" />
        <text x="16" y="140" fill="#c4b5fd" fontSize="7" fontFamily="Inter, system-ui, sans-serif">
          Sync · Tax · PDF
        </text>
      </g>
    </svg>
  </div>
);

const MobilePortfolioVisual = () => (
  <div className="portfolio-visual" aria-hidden="true">
    <svg viewBox="0 0 420 240" className="mock-svg" role="img">
      <defs>
        <linearGradient id="mAppBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <linearGradient id="mPhone1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <linearGradient id="mPhone2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="mPhone3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" rx="18" fill="url(#mAppBg)" />
      <text x="28" y="36" fill="#e5e7eb" fontSize="12" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
        Native-ready product apps
      </text>
      <text x="28" y="54" fill="#9ca3af" fontSize="8" fontFamily="Inter, system-ui, sans-serif">
        Store launch pending · production builds ready
      </text>
      <g transform="translate(40 72) rotate(-8 40 70)">
        <rect width="80" height="150" rx="14" fill="#0f172a" stroke="#fdba74" strokeWidth="2.5" />
        <rect x="6" y="12" width="68" height="126" rx="9" fill="url(#mPhone1)" />
        <text x="16" y="36" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Orders
        </text>
        <rect x="14" y="48" width="52" height="18" rx="6" fill="#fff" fillOpacity="0.2" />
        <rect x="14" y="74" width="52" height="18" rx="6" fill="#fff" fillOpacity="0.14" />
      </g>
      <g transform="translate(150 58)">
        <rect width="80" height="150" rx="14" fill="#0f172a" stroke="#67e8f9" strokeWidth="2.5" />
        <rect x="6" y="12" width="68" height="126" rx="9" fill="url(#mPhone2)" />
        <text x="16" y="36" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Wallet
        </text>
        <text x="16" y="58" fill="#fff" fontSize="12" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
          $2,480
        </text>
        <rect x="14" y="74" width="52" height="12" rx="6" fill="#fff" fillOpacity="0.22" />
      </g>
      <g transform="translate(260 72) rotate(8 40 70)">
        <rect width="80" height="150" rx="14" fill="#0f172a" stroke="#c4b5fd" strokeWidth="2.5" />
        <rect x="6" y="12" width="68" height="126" rx="9" fill="url(#mPhone3)" />
        <text x="16" y="36" fill="#fff" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          Coach
        </text>
        <circle cx="40" cy="78" r="18" fill="#fff" fillOpacity="0.18" />
        <text x="30" y="82" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          AI
        </text>
      </g>
    </svg>
  </div>
);

const api = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "Request failed");
  }
  return body;
};

const PublicWebsite = () => {
  const [form, setForm] = useState({ full_name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("");
  const [stats, setStats] = useState({ projects: 0, satisfaction: 0, countries: 0 });

  const bulletPoints = [
    "UX-first execution with modern visual identity",
    "Fast builds with clean, scalable architecture",
    "Marketing-ready websites you can confidently share",
  ];

  const services = [
    {
      icon: Layout,
      title: "Web Product Design & Development",
      description:
        "High-performance websites and web apps with strong branding, intuitive UX, and SEO-friendly structure.",
      featured: true,
      accent: "blue",
      visual: "web",
      tags: ["Performance", "Branding", "UX Focus"],
    },
    {
      icon: Smartphone,
      title: "Mobile Applications",
      description:
        "Polished cross-platform mobile experiences focused on retention, usability, and business impact.",
      accent: "purple",
      visual: "mobile",
    },
    {
      icon: Bot,
      title: "AI Workflow Integration",
      description:
        "Practical AI integrations that streamline support, insights, and decision-making without complexity.",
      accent: "blue",
      visual: "ai",
    },
    {
      icon: Cpu,
      title: "Digital Transformation",
      description:
        "Internal dashboards and process systems that reduce manual work and improve operational visibility.",
      accent: "slate",
    },
  ];

  const processSteps = [
    {
      num: "01",
      title: "Discovery & Strategy",
      description: "We align on goals, audience, brand direction, and technical scope.",
      icon: Compass,
    },
    {
      num: "02",
      title: "UI/UX & Prototype",
      description: "We craft a modern visual direction and interactive user journey.",
      icon: PenTool,
    },
    {
      num: "03",
      title: "Build & Optimize",
      description: "We implement fast, accessible, and responsive frontend/backend systems.",
      icon: Code2,
    },
    {
      num: "04",
      title: "Launch & Support",
      description: "We deploy, monitor, and continuously improve performance and conversion.",
      icon: Rocket,
    },
  ];

  const portfolio = [
    {
      icon: Plane,
      category: "Travel & Transportation",
      title: "Al-Fairuz Travel Platform",
      description:
        "End-to-end booking experience for routes, bundles, buses, and multilingual travelers — live in production for a tourism operator.",
      tags: ["Web app", "Booking flows", "Multi-currency"],
      href: "https://app.elfayrouz-traveleg.com/",
      cta: "Visit live product",
      visual: "travel",
      featured: true,
      accent: "cyan",
    },
    {
      icon: Stethoscope,
      category: "Health & AgriTech",
      title: "Digital Vet",
      description:
        "A digital poultry disease reference that helps farms and vets search symptoms, browse clinical knowledge, and act faster in the field.",
      tags: ["Knowledge base", "Web product", "Domain UX"],
      href: "https://digital-vet.com/",
      cta: "Explore the guide",
      visual: "vet",
      accent: "green",
    },
    {
      icon: Receipt,
      category: "FinOps & SaaS",
      title: "Integrated Invoicing System",
      description:
        "Fully integrated invoicing with client ledgers, payment status, PDF export, and cashflow visibility — running in production for daily operations.",
      tags: ["Billing", "PDF & tax", "Dashboards"],
      visual: "invoice",
      badge: "Production system",
      accent: "violet",
    },
    {
      icon: Smartphone,
      category: "Mobile Products",
      title: "Consumer & Ops Mobile Apps",
      description:
        "Cross-platform mobile experiences for orders, wallets, and AI-assisted coaching. Production builds are ready; store publication is in progress.",
      tags: ["iOS / Android", "UX systems", "Launch-ready"],
      visual: "mobileApps",
      badge: "Store launch pending",
      accent: "orange",
    },
  ];

  useEffect(() => {
    const targets = { projects: 45, satisfaction: 98, countries: 12 };
    const durationMs = 1500;
    const start = performance.now();
    let frameId = null;

    const tick = (now) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setStats({
        projects: Math.round(targets.projects * progress),
        satisfaction: Math.round(targets.satisfaction * progress),
        countries: Math.round(targets.countries * progress),
      });
      if (progress < 1) frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const submitInquiry = async (event) => {
    event.preventDefault();
    setStatus("Sending...");
    try {
      await api("/api/public/inquiries", { method: "POST", body: JSON.stringify(form) });
      setStatus("Inquiry sent successfully.");
      setForm({ full_name: "", email: "", company: "", message: "" });
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="gemini-site">
      <div className="bg-glow glow-one" aria-hidden="true" />
      <div className="bg-glow glow-two" aria-hidden="true" />
      <div className="floating-star" aria-hidden="true">
        ✦
      </div>

      <header className="gemini-header">
        <nav className="gemini-nav">
          <a className="brand-mark" href="/">
            <span className="brand-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span>Digi-Tech</span>
          </a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#process">Process</a>
            <a href="#results">Results</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="nav-cta" href="#contact">
            Talk to an Expert
          </a>
        </nav>
      </header>

      <section className="gemini-hero" id="hero">
        <div className="hero-copy">
          <span className="eyebrow-pill">Global Product Engineering Studio</span>
          <h1>
            <span className="hero-line">Engineering high-performing digital products that drive</span>
            <span className="hero-line text-gradient">revenue, engagement, and effortless scale.</span>
          </h1>
          <p className="lead">
            We help ambitious brands launch premium web and mobile experiences, automate operations, and
            integrate AI workflows that create measurable growth.
          </p>
          <div className="hero-actions">
            <a className="btn-primary" href="#contact">
              Book a strategy call
              <ArrowRight size={20} />
            </a>
            <a className="btn-secondary" href="#work">
              See selected work
            </a>
          </div>
          <ul className="hero-points">
            {bulletPoints.map((text) => (
              <li key={text}>
                <span className="point-icon" aria-hidden="true">
                  <Check size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero-card-wrap">
          <div className="hero-card-glow" aria-hidden="true" />
          <div className="hero-card">
            <h3>Why clients choose Digi-Tech</h3>
            <p>
              We blend design quality, technical depth, and business clarity so your website is not only
              beautiful, but persuasive and conversion-ready.
            </p>
            <div className="mini-stats">
              <div className="stat-row">
                <strong className="stat-blue">{stats.projects}+</strong>
                <span>
                  Projects
                  <br />
                  delivered
                </span>
              </div>
              <div className="stat-row">
                <strong className="stat-purple">{stats.satisfaction}%</strong>
                <span>
                  Client
                  <br />
                  satisfaction
                </span>
              </div>
              <div className="stat-row">
                <strong>{stats.countries}</strong>
                <span>
                  Countries
                  <br />
                  served
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="gemini-section" id="services">
        <div className="section-intro">
          <h2>Our Core Capabilities</h2>
          <p>Tailored digital engineering to accelerate your growth.</p>
        </div>
        <div className="bento-grid">
          {services.map((service) => {
            const Icon = service.icon;
            const accent = service.accent || "slate";
            return (
              <article
                key={service.title}
                className={`bento-card accent-${accent}${service.featured ? " wide featured" : ""}${
                  service.visual ? " has-visual" : ""
                }`}
              >
                <div className={`service-icon accent-${accent}`}>
                  <Icon size={22} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                {service.tags ? (
                  <div className="service-tags">
                    {service.tags.map((tag, tagIndex) => (
                      <span key={tag}>
                        {tagIndex > 0 ? <span className="tag-dot">•</span> : null}
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {service.visual === "web" ? <WebProductVisual /> : null}
                {service.visual === "mobile" ? <MobileAppsVisual /> : null}
                {service.visual === "ai" ? <AiNetworkVisual /> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="gemini-section" id="work">
        <div className="section-intro">
          <h2>Selected work across industries</h2>
          <p>
            From tourism booking and veterinary knowledge tools to invoicing ops and mobile products — we design
            and ship reliable systems for real businesses.
          </p>
        </div>
        <div className="portfolio-grid">
          {portfolio.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`portfolio-card accent-${item.accent}${item.featured ? " featured" : ""}`}
              >
                <div className="portfolio-meta">
                  <span className={`portfolio-icon accent-${item.accent}`}>
                    <Icon size={18} />
                  </span>
                  <span className="portfolio-category">{item.category}</span>
                  {item.badge ? <span className="portfolio-badge">{item.badge}</span> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="portfolio-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                {item.visual === "travel" ? <TravelPortfolioVisual /> : null}
                {item.visual === "vet" ? <VetPortfolioVisual /> : null}
                {item.visual === "invoice" ? <InvoicePortfolioVisual /> : null}
                {item.visual === "mobileApps" ? <MobilePortfolioVisual /> : null}
                {item.href ? (
                  <a className="portfolio-link" href={item.href} target="_blank" rel="noreferrer">
                    {item.cta}
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <span className="portfolio-link muted">{item.badge || "Private client delivery"}</span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="gemini-section" id="process">
        <div className="process-panel">
          <h2>Collaboration Process</h2>
          <div className="process-grid">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.num} className={index === 0 ? "process-active" : undefined}>
                  <div className="step-head">
                    <span>{step.num}</span>
                    <Icon size={16} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gemini-section" id="results">
        <div className="results-panel">
          <h2>Results-focused delivery</h2>
          <p className="results-copy">
            Every engagement is built around growth metrics: stronger first impressions, clearer messaging, and
            smoother user journeys that turn visitors into qualified leads.
          </p>
          <div className="results-graph" aria-label="Sample project impact graph">
            <article>
              <div className="graph-label">
                <span>Conversion lift</span>
                <strong>+68%</strong>
              </div>
              <div className="bar-track">
                <span className="bar-fill fill-conversion" />
              </div>
            </article>
            <article>
              <div className="graph-label">
                <span>Page speed improvement</span>
                <strong>+52%</strong>
              </div>
              <div className="bar-track">
                <span className="bar-fill fill-speed" />
              </div>
            </article>
            <article>
              <div className="graph-label">
                <span>Mobile engagement</span>
                <strong>+74%</strong>
              </div>
              <div className="bar-track">
                <span className="bar-fill fill-mobile" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="gemini-section" id="contact">
        <div className="contact-panel">
          <div className="contact-heading">
            <h2>Ready to elevate your online presence?</h2>
            <p>
              Send your project brief and we will share the best approach for design, development, timeline, and
              budget fit.
            </p>
          </div>
          <form onSubmit={submitInquiry} className="form-grid">
            <input
              placeholder="Full name"
              value={form.full_name}
              onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Business email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            <input
              placeholder="Company"
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
            />
            <textarea
              placeholder="Tell us about your project, audience, and goals..."
              rows={5}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
            />
            <button className="btn-primary" type="submit">
              Send inquiry
            </button>
          </form>
          {status ? <p className="status">{status}</p> : null}
          <p className="admin-link">
            Internal access only: <a href="/admin">Admin dashboard</a>
          </p>
        </div>
      </section>

      <footer className="gemini-footer">
        <a className="brand-mark" href="/">
          <span className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>
          <span>Digi-Tech</span>
        </a>
        <p>© 2026 Digi-Tech Studio. All rights reserved.</p>
        <div className="footer-links">
          <a href="#contact">Privacy</a>
          <a href="#contact">Terms</a>
        </div>
      </footer>
    </div>
  );
};

const emptyProject = {
  client_name: "",
  project_name: "",
  currency: "USD",
  total_price: "",
  paid_amount: "",
  start_date: "",
  deadline: "",
  status: "planned",
  notes: "",
};

const emptyChangeRequest = {
  project_id: "",
  title: "",
  description: "",
  price: "",
  deposit_amount: "0",
  start_date: "",
  deadline: "",
  estimated_days: "",
  status: "draft",
};

const AdminDashboard = () => {
  const [sessionReady, setSessionReady] = useState(false);
  const [projects, setProjects] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [overview, setOverview] = useState(null);
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [projectEditingId, setProjectEditingId] = useState(null);
  const [changeForm, setChangeForm] = useState(emptyChangeRequest);
  const [changeEditingId, setChangeEditingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const isAdminPath = window.location.pathname.startsWith("/admin");

  const loadDashboard = async () => {
    const query = currencyFilter ? `?currency=${encodeURIComponent(currencyFilter)}` : "";
    const [projectsBody, changesBody, overviewBody] = await Promise.all([
      api(`/api/admin/projects${query}`),
      api(`/api/admin/change-requests${query}`),
      api(`/api/admin/overview${query}`),
    ]);
    setProjects(projectsBody.projects || []);
    setChangeRequests(changesBody.change_requests || []);
    setOverview(overviewBody);
  };

  useEffect(() => {
    if (!sessionReady) return;
    loadDashboard().catch((loadError) => setError(loadError.message));
  }, [sessionReady, currencyFilter]);

  const totals = overview?.totals || {};
  const changeSummary = overview?.change_requests_summary || {};
  const dashboardCurrency = useMemo(() => {
    if (overview?.currency) return overview.currency;
    const currencies = [...new Set(projects.map((project) => project.currency).filter(Boolean))];
    return currencies.length === 1 ? currencies[0] : "USD";
  }, [overview, projects]);

  const login = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify(loginData) });
      setSessionReady(true);
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST", body: JSON.stringify({}) });
    setSessionReady(false);
    setOverview(null);
    setProjects([]);
    setChangeRequests([]);
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...projectForm,
        total_price: Number(projectForm.total_price),
        paid_amount: Number(projectForm.paid_amount || 0),
        milestones: [],
      };
      if (projectEditingId) {
        await api(`/api/admin/projects/${projectEditingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/admin/projects", { method: "POST", body: JSON.stringify(payload) });
      }
      setProjectForm(emptyProject);
      setProjectEditingId(null);
      setFeedback("Project saved.");
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    await api(`/api/admin/projects/${projectId}`, { method: "DELETE", body: JSON.stringify({}) });
    await loadDashboard();
  };

  const saveChangeRequest = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...changeForm,
        project_id: Number(changeForm.project_id),
        price: Number(changeForm.price),
        deposit_amount: Number(changeForm.deposit_amount || 0),
        estimated_days: changeForm.estimated_days ? Number(changeForm.estimated_days) : null,
        start_date: changeForm.start_date || null,
        deadline: changeForm.deadline || null,
      };
      if (changeEditingId) {
        await api(`/api/admin/change-requests/${changeEditingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/admin/change-requests", { method: "POST", body: JSON.stringify(payload) });
      }
      setChangeForm(emptyChangeRequest);
      setChangeEditingId(null);
      setFeedback("Change request saved.");
      await loadDashboard();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const deleteChangeRequest = async (changeRequestId) => {
    if (!window.confirm("Delete this change request?")) return;
    await api(`/api/admin/change-requests/${changeRequestId}`, { method: "DELETE", body: JSON.stringify({}) });
    await loadDashboard();
  };

  const beginChangeEdit = (item) => {
    setChangeEditingId(item.id);
    setChangeForm({
      project_id: String(item.project_id),
      title: item.title || "",
      description: item.description || "",
      price: String(item.price || ""),
      deposit_amount: String(item.deposit_amount || 0),
      start_date: item.start_date || "",
      deadline: item.deadline || "",
      estimated_days: item.estimated_days === null ? "" : String(item.estimated_days),
      status: item.status || "draft",
    });
  };

  const beginProjectEdit = (item) => {
    setProjectEditingId(item.id);
    setProjectForm({
      client_name: item.client_name || "",
      project_name: item.project_name || "",
      currency: item.currency || "USD",
      total_price: String(item.total_price || ""),
      paid_amount: String(item.paid_amount || ""),
      start_date: item.start_date || "",
      deadline: item.deadline || "",
      status: item.status || "planned",
      notes: item.notes || "",
    });
  };

  if (!isAdminPath) return <PublicWebsite />;

  if (!sessionReady) {
    return (
      <main className="site">
        <section className="panel auth-panel">
          <h1>Admin Login</h1>
          <form onSubmit={login} className="form-grid">
            <input
              type="email"
              placeholder="Admin email"
              value={loginData.email}
              onChange={(event) => setLoginData((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(event) => setLoginData((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <button className="button" type="submit">
              Login
            </button>
          </form>
          {error ? <p className="error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="site admin">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Projects & Payments Dashboard</h1>
        </div>
        <div className="header-actions">
          <select value={currencyFilter} onChange={(event) => setCurrencyFilter(event.target.value)}>
            <option value="">All currencies</option>
            <option value="USD">USD</option>
            <option value="EGP">EGP</option>
          </select>
          <button className="button secondary" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      <section className="metrics">
        <article><h3>Total Projects</h3><p>{totals.total_projects || 0}</p></article>
        <article><h3>Active Projects</h3><p>{totals.active_projects || 0}</p></article>
        <article><h3>Total Revenue</h3><p>{formatCurrency(totals.total_revenue_with_addons || totals.total_paid || 0, dashboardCurrency)}</p></article>
        <article><h3>Pending Balance</h3><p>{formatCurrency((totals.total_remaining || 0) + (changeSummary.pending_settlements || 0), dashboardCurrency)}</p></article>
        <article><h3>Open Changes</h3><p>{changeSummary.open_requests || 0}</p></article>
      </section>

      <section className="split">
        <article className="panel">
          <h2>{projectEditingId ? "Edit Project" : "Add Project"}</h2>
          <form onSubmit={saveProject} className="form-grid">
            <input placeholder="Client name" value={projectForm.client_name} onChange={(e) => setProjectForm((p) => ({ ...p, client_name: e.target.value }))} required />
            <input placeholder="Project name" value={projectForm.project_name} onChange={(e) => setProjectForm((p) => ({ ...p, project_name: e.target.value }))} required />
            <select value={projectForm.currency} onChange={(e) => setProjectForm((p) => ({ ...p, currency: e.target.value }))}>
              <option value="USD">USD</option>
              <option value="EGP">EGP</option>
            </select>
            <input type="number" min="0" step="0.01" placeholder="Total price" value={projectForm.total_price} onChange={(e) => setProjectForm((p) => ({ ...p, total_price: e.target.value }))} required />
            <input type="number" min="0" step="0.01" placeholder="Paid amount" value={projectForm.paid_amount} onChange={(e) => setProjectForm((p) => ({ ...p, paid_amount: e.target.value }))} required />
            <input type="date" value={projectForm.start_date} onChange={(e) => setProjectForm((p) => ({ ...p, start_date: e.target.value }))} required />
            <input type="date" value={projectForm.deadline} onChange={(e) => setProjectForm((p) => ({ ...p, deadline: e.target.value }))} required />
            <select value={projectForm.status} onChange={(e) => setProjectForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <textarea
              placeholder="Notes"
              rows={3}
              value={projectForm.notes}
              onChange={(e) => setProjectForm((p) => ({ ...p, notes: e.target.value }))}
            />
            <button className="button" type="submit">Save Project</button>
          </form>
        </article>

        <article className="panel">
          <h2>{changeEditingId ? "Edit Change Request" : "Add Change Request"}</h2>
          <form onSubmit={saveChangeRequest} className="form-grid">
            <select value={changeForm.project_id} onChange={(e) => setChangeForm((p) => ({ ...p, project_id: e.target.value }))} required>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  #{project.id} {project.project_name}
                </option>
              ))}
            </select>
            <input placeholder="Request title" value={changeForm.title} onChange={(e) => setChangeForm((p) => ({ ...p, title: e.target.value }))} required />
            <input type="number" min="0" step="0.01" placeholder="Price" value={changeForm.price} onChange={(e) => setChangeForm((p) => ({ ...p, price: e.target.value }))} required />
            <input type="number" min="0" step="0.01" placeholder="Deposit" value={changeForm.deposit_amount} onChange={(e) => setChangeForm((p) => ({ ...p, deposit_amount: e.target.value }))} required />
            <input type="date" value={changeForm.start_date} onChange={(e) => setChangeForm((p) => ({ ...p, start_date: e.target.value }))} />
            <input type="date" value={changeForm.deadline} onChange={(e) => setChangeForm((p) => ({ ...p, deadline: e.target.value }))} />
            <input type="number" min="0" step="1" placeholder="Estimated days" value={changeForm.estimated_days} onChange={(e) => setChangeForm((p) => ({ ...p, estimated_days: e.target.value }))} />
            <select value={changeForm.status} onChange={(e) => setChangeForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <textarea
              placeholder="Scope details"
              rows={3}
              value={changeForm.description}
              onChange={(e) => setChangeForm((p) => ({ ...p, description: e.target.value }))}
            />
            <button className="button" type="submit">Save Change Request</button>
          </form>
        </article>
      </section>

      <section className="panel">
        <h2>Projects</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Project</th>
                <th>Status</th>
                <th>Financials</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.client_name}</td>
                  <td>{project.project_name}</td>
                  <td>{project.metrics?.effective_status || project.status}</td>
                  <td>
                    {formatCurrency(project.paid_amount, project.currency)} / {formatCurrency(project.total_price, project.currency)}
                  </td>
                  <td>{project.deadline}</td>
                  <td>
                    <button className="link" onClick={() => beginProjectEdit(project)} type="button">Edit</button>
                    <button className="link danger" onClick={() => deleteProject(project.id)} type="button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Change Requests</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Request</th>
                <th>Financials</th>
                <th>Timeline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {changeRequests.map((item) => (
                <tr key={item.id}>
                  <td>{item.project_name}</td>
                  <td>{item.title}</td>
                  <td>
                    {formatCurrency(item.price, item.currency)} | Deposit: {formatCurrency(item.deposit_amount, item.currency)}
                  </td>
                  <td>{item.start_date || "-"} → {item.deadline || "-"}</td>
                  <td>{item.status}</td>
                  <td>
                    <button className="link" onClick={() => beginChangeEdit(item)} type="button">Edit</button>
                    <button className="link danger" onClick={() => deleteChangeRequest(item.id)} type="button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {feedback ? <p className="status">{feedback}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
};

function App() {
  return <AdminDashboard />;
}

export default App;
