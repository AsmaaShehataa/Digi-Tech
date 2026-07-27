import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Compass,
  Cpu,
  Layout,
  PenTool,
  Rocket,
  Smartphone,
} from "lucide-react";
import "./App.css";

const currencyFormatter = (currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

const formatCurrency = (amount, currency = "USD") => currencyFormatter(currency).format(Number(amount || 0));

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
      visual: "dashboard",
    },
    {
      icon: Smartphone,
      title: "Mobile Applications",
      description:
        "Polished cross-platform mobile experiences focused on retention, usability, and business impact.",
      visual: "mobile",
    },
    {
      icon: Cpu,
      title: "Digital Transformation",
      description:
        "Internal dashboards and process systems that reduce manual work and improve operational visibility.",
    },
    {
      icon: Bot,
      title: "AI Workflow Integration",
      description:
        "Practical AI integrations that streamline support, insights, and decision-making without complexity.",
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
    <main className="site public-site premium-v2">
      <div className="bg-glow glow-one" aria-hidden="true" />
      <div className="bg-glow glow-two" aria-hidden="true" />
      <div className="floating-star" aria-hidden="true">✦</div>

      <header className="marketing-nav">
        <a className="brand-mark" href="/">
          <span className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <defs>
                <linearGradient id="logoGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradient)" />
              <path d="M30 10v12h8l-14 16v-12h-8z" fill="#ffffff" opacity="0.93" />
            </svg>
          </span>
          <span>Digi-Tech</span>
        </a>
        <nav>
          <a href="#services">Services</a>
          <a href="#process">Process</a>
          <a href="#results">Results</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="button secondary nav-cta" href="#contact">
          Talk to an Expert
        </a>
      </header>

      <section className="hero premium" id="hero">
        <div>
          <p className="eyebrow">Global Product Engineering Studio</p>
          <h1>
            Design-forward digital products built to{" "}
            <span className="hero-emphasis">convert, retain, and scale.</span>
          </h1>
          <p className="lead">
            We help ambitious brands launch premium web and mobile experiences, automate operations, and
            integrate AI workflows that create measurable growth.
          </p>
          <div className="hero-actions">
            <a className="button" href="#contact">
              Book a strategy call
              <ArrowRight size={16} />
            </a>
            <a className="button secondary" href="#results">
              See case-style outcomes
            </a>
          </div>
          <ul className="hero-points">
            {bulletPoints.map((text) => (
              <li key={text}>
                <span className="point-icon" aria-hidden="true">
                  <Check size={13} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <aside className="hero-highlight">
          <h3>Why clients choose Digi-Tech</h3>
          <p>
            We blend design quality, technical depth, and business clarity so your website is not only beautiful,
            but persuasive and conversion-ready.
          </p>
          <div className="mini-stats">
            <div>
              <strong>{stats.projects}+</strong>
              <span>Projects delivered</span>
            </div>
            <div>
              <strong>{stats.satisfaction}%</strong>
              <span>Client satisfaction</span>
            </div>
            <div>
              <strong>{stats.countries}</strong>
              <span>Countries served</span>
            </div>
          </div>
        </aside>
      </section>

      <h2 className="section-label" id="services">Services</h2>

      <section className="cards bento-cards">
        {services.map((service, index) => {
          const Icon = service.icon;
          const isWide = service.featured || index === services.length - 1;
          return (
            <article key={service.title} className={`${service.featured ? "featured-service" : ""} ${isWide ? "bento-wide" : ""}`}>
              <div className="service-icon-row">
                <span className="service-icon">
                  <Icon size={18} />
                </span>
                {service.featured ? <span className="service-badge">Featured</span> : null}
              </div>
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              {service.visual === "dashboard" ? (
                <div className="service-visual dashboard-visual" aria-hidden="true">
                  <span className="screen-card" />
                  <span className="screen-chip" />
                  <span className="screen-card secondary" />
                </div>
              ) : null}
              {service.visual === "mobile" ? (
                <div className="service-visual mobile-visual" aria-hidden="true">
                  <span className="phone one" />
                  <span className="phone two" />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="panel process-panel" id="process">
        <h2>Collaboration Process</h2>
        <div className="process-grid">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.num}>
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
      </section>

      <section className="panel results-panel" id="results">
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
      </section>

      <section className="panel contact-panel" id="contact">
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
          <input placeholder="Target launch timeline" />
          <textarea
            placeholder="Tell us about your project, audience, and goals..."
            rows={5}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            required
          />
          <button className="button" type="submit">
            Send inquiry
          </button>
        </form>
        {status ? <p className="status">{status}</p> : null}
        <p className="admin-link">
          Internal access only: <a href="/admin">Admin dashboard</a>
        </p>
      </section>

      <footer className="marketing-footer">
        <a className="brand-mark" href="/">
          <span className="brand-logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" focusable="false">
              <defs>
                <linearGradient id="logoGradientFooter" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGradientFooter)" />
              <path d="M30 10v12h8l-14 16v-12h-8z" fill="#ffffff" opacity="0.93" />
            </svg>
          </span>
          <span>Digi-Tech</span>
        </a>
        <p>© 2026 Digi-Tech Studio. All rights reserved.</p>
      </footer>
    </main>
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
