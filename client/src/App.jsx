import { useEffect, useMemo, useState } from "react";
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
    <main className="site">
      <section className="hero">
        <p className="eyebrow">Digi-Tech</p>
        <h1>Web, Mobile, and AI Solutions That Scale</h1>
        <p>
          We rebuild and deliver high-performance digital products for global clients: modern web apps,
          mobile platforms, internal dashboards, and AI-enabled workflows.
        </p>
        <a className="button" href="/admin">
          Open Admin Dashboard
        </a>
      </section>

      <section className="cards">
        <article>
          <h2>Web Engineering</h2>
          <p>React-based frontend architectures, API-first backend services, and scalable production deployments.</p>
        </article>
        <article>
          <h2>Mobile Apps</h2>
          <p>Cross-platform product delivery with maintainable architecture and strong UX foundations.</p>
        </article>
        <article>
          <h2>Digital Transformation</h2>
          <p>Admin panels, process automation, and KPI visibility to modernize your service operations.</p>
        </article>
        <article>
          <h2>AI Integration</h2>
          <p>Assistive workflows, automation, and decision support integrated safely into your existing products.</p>
        </article>
      </section>

      <section className="panel">
        <h2>Contact Digi-Tech</h2>
        <form onSubmit={submitInquiry} className="form-grid">
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
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
            placeholder="Tell us about your project"
            rows={4}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            required
          />
          <button className="button" type="submit">
            Send Inquiry
          </button>
        </form>
        {status ? <p className="status">{status}</p> : null}
      </section>
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
