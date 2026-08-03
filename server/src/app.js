const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const { DashboardRepository, buildOverview, serializeCsv, normalizeCurrency, normalizeChangeRequestStatus } = require("./repository");

dotenv.config({ path: path.join(__dirname, "../.env") });

const BASE_DIR = path.resolve(__dirname, "../..");
const DATA_DIR = path.join(BASE_DIR, "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "admin_dashboard.db");
const APP_DEPLOY_TARGET = (process.env.APP_DEPLOY_TARGET || "public").trim().toLowerCase() === "admin_internal"
  ? "admin_internal"
  : "public";
const ADMIN_MODULE_ENABLED = APP_DEPLOY_TARGET === "admin_internal";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@digi-tech.local").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.FLASK_SECRET_KEY || "dev-secret-change-in-production";
const PUBLIC_API_ALLOWED_ORIGINS = (process.env.PUBLIC_API_ALLOWED_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const PUBLIC_API_ALLOW_CREDENTIALS = process.env.PUBLIC_API_ALLOW_CREDENTIALS === "1";
const ADMIN_ALLOWED_IPS = (process.env.ADMIN_ALLOWED_IPS || "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const CURRENCY_SYMBOLS = { USD: "$", EGP: "E£" };

const clientDistPath = path.join(BASE_DIR, "client", "dist");
const app = express();
const repo = new DashboardRepository({ dbPath: DB_PATH, adminEmail: ADMIN_EMAIL, adminPassword: ADMIN_PASSWORD });

const normalizeOrigin = (origin) => (origin || "").trim().replace(/\/$/, "");
const isPublicOriginAllowed = (origin) => {
  if (!origin) return false;
  if (PUBLIC_API_ALLOWED_ORIGINS.includes("*")) return true;
  return PUBLIC_API_ALLOWED_ORIGINS.includes(normalizeOrigin(origin));
};

const getClientIp = (req) => {
  const forwarded = String(req.headers["x-forwarded-for"] || "").trim();
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || "";
};

const isAdminIpAllowed = (req) => {
  if (!ADMIN_ALLOWED_IPS.length) return true;
  const ip = getClientIp(req);
  return ADMIN_ALLOWED_IPS.some((entry) => ip === entry || ip.startsWith(entry));
};

const requireAdminApi = (req, res, next) => {
  if (!ADMIN_MODULE_ENABLED) return res.status(404).json({ error: "Not found" });
  if (!isAdminIpAllowed(req)) return res.status(403).json({ error: "Forbidden" });
  if (!req.session.admin_user_id) return res.status(401).json({ error: "Authentication required" });
  return next();
};

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(
  "/api/public",
  cors({
    origin: (origin, callback) => {
      if (!origin || isPublicOriginAllowed(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"), false);
    },
    credentials: PUBLIC_API_ALLOW_CREDENTIALS,
  })
);

app.get("/api/public/health", (req, res) => {
  res.json({
    status: "ok",
    app_deploy_target: APP_DEPLOY_TARGET,
    admin_module_enabled: ADMIN_MODULE_ENABLED,
    database_backend: "sqlite",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/public/inquiries", async (req, res) => {
  try {
    const inquiry = await repo.createInquiry(req.body || {});
    return res.status(201).json({ inquiry });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  if (!ADMIN_MODULE_ENABLED) return res.status(404).json({ error: "Not found" });
  if (!isAdminIpAllowed(req)) return res.status(403).json({ error: "Forbidden" });
  const { email, password } = req.body || {};
  const user = await repo.authenticateAdmin(email, password);
  if (!user) return res.status(401).json({ error: "Invalid credentials." });
  req.session.admin_user_id = user.id;
  req.session.admin_email = user.email;
  return res.json({ user, message: "Login successful." });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logout successful." }));
});

app.get("/api/admin/projects", requireAdminApi, async (req, res) => {
  try {
    const currency = req.query.currency ? normalizeCurrency(req.query.currency) : null;
    const projects = await repo.listProjects(currency);
    return res.json({ projects });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/projects", requireAdminApi, async (req, res) => {
  try {
    const project = await repo.createProject(req.body || {});
    return res.status(201).json({ project });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put("/api/admin/projects/:projectId", requireAdminApi, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const project = await repo.updateProject(projectId, req.body || {});
    return res.json({ project });
  } catch (error) {
    if (error.message === "Project not found") return res.status(404).json({ error: error.message });
    return res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/projects/:projectId", requireAdminApi, async (req, res) => {
  await repo.deleteProject(Number(req.params.projectId));
  return res.json({ message: "Project deleted" });
});

app.get("/api/admin/change-requests", requireAdminApi, async (req, res) => {
  try {
    const projectIdRaw = req.query.project_id;
    const statusRaw = req.query.status;
    const currencyRaw = req.query.currency;
    const filters = {
      projectId: projectIdRaw ? Number(projectIdRaw) : null,
      status: statusRaw ? normalizeChangeRequestStatus(statusRaw) : null,
      currency: currencyRaw ? normalizeCurrency(currencyRaw) : null,
    };
    const changeRequests = await repo.listChangeRequests(filters);
    return res.json({ change_requests: changeRequests });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/change-requests", requireAdminApi, async (req, res) => {
  try {
    const changeRequest = await repo.createChangeRequest(req.body || {});
    return res.status(201).json({ change_request: changeRequest });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get("/api/admin/change-requests/:changeRequestId", requireAdminApi, async (req, res) => {
  try {
    const changeRequest = await repo.getChangeRequest(Number(req.params.changeRequestId));
    return res.json({ change_request: changeRequest });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

app.put("/api/admin/change-requests/:changeRequestId", requireAdminApi, async (req, res) => {
  try {
    const changeRequest = await repo.updateChangeRequest(Number(req.params.changeRequestId), req.body || {});
    return res.json({ change_request: changeRequest });
  } catch (error) {
    if (error.message === "Change request not found") return res.status(404).json({ error: error.message });
    return res.status(400).json({ error: error.message });
  }
});

app.delete("/api/admin/change-requests/:changeRequestId", requireAdminApi, async (req, res) => {
  await repo.deleteChangeRequest(Number(req.params.changeRequestId));
  return res.json({ message: "Change request deleted" });
});

app.get("/api/admin/overview", requireAdminApi, async (req, res) => {
  try {
    const currency = req.query.currency ? normalizeCurrency(req.query.currency) : null;
    const [projects, changeRequests] = await Promise.all([
      repo.listProjects(currency),
      repo.listChangeRequests({ currency }),
    ]);
    return res.json(buildOverview(projects, changeRequests, currency));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get("/api/admin/export.csv", requireAdminApi, async (req, res) => {
  try {
    const currency = req.query.currency ? normalizeCurrency(req.query.currency) : null;
    const projects = await repo.listProjects(currency);
    const payload = serializeCsv(projects);
    const suffix = currency ? currency.toLowerCase() : "all-currencies";
    res.setHeader("Content-Disposition", `attachment; filename=admin-project-report-${suffix}.csv`);
    return res.type("text/csv").send(payload);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get("/api/admin/export.json", requireAdminApi, async (req, res) => {
  try {
    const currency = req.query.currency ? normalizeCurrency(req.query.currency) : null;
    const [projects, changeRequests] = await Promise.all([
      repo.listProjects(currency),
      repo.listChangeRequests({ currency }),
    ]);
    const payload = {
      generated_at: new Date().toISOString(),
      app_deploy_target: APP_DEPLOY_TARGET,
      currency_filter: currency,
      overview: buildOverview(projects, changeRequests, currency),
      projects,
      change_requests: changeRequests,
    };
    const suffix = currency ? currency.toLowerCase() : "all-currencies";
    res.setHeader("Content-Disposition", `attachment; filename=admin-project-report-${suffix}.json`);
    return res.json(payload);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/share-report", requireAdminApi, async (req, res) => {
  try {
    const currency = req.body?.currency ? normalizeCurrency(req.body.currency) : null;
    const [projects, changeRequests] = await Promise.all([
      repo.listProjects(currency),
      repo.listChangeRequests({ currency }),
    ]);
    const overview = buildOverview(projects, changeRequests, currency);
    const totals = overview.totals;
    const changeSummary = overview.change_requests_summary;
    const symbol = CURRENCY_SYMBOLS[currency || "USD"] || "$";
    const clientEmail = String(req.body?.client_email || "").trim();
    const adminEmail = String(req.body?.admin_email || "").trim();
    if (!clientEmail && !adminEmail) {
      return res.status(400).json({ error: "Please provide at least one recipient email." });
    }
    const recipients = [clientEmail, adminEmail].filter(Boolean).join(",");
    const subject = `Digi-Tech Project & Financial Report (${currency || "ALL"})`;
    const body = [
      "Hello,",
      "",
      `Total projects: ${totals.total_projects}`,
      `Active projects: ${totals.active_projects}`,
      `Completed projects: ${totals.completed_projects}`,
      `Total revenues (including add-ons): ${symbol}${totals.total_revenue_with_addons.toFixed(2)}`,
      `Pending payments: ${totals.pending_payments_count} (${symbol}${totals.pending_payments_amount.toFixed(2)})`,
      `Overdue payments: ${totals.overdue_payments_count} (${symbol}${totals.overdue_payments_amount.toFixed(2)})`,
      `Open change requests: ${changeSummary.open_requests}`,
      `Approved change value: ${symbol}${changeSummary.approved_value.toFixed(2)}`,
      `Change deposits recognized: ${symbol}${changeSummary.deposit_collected.toFixed(2)}`,
      `Change revenue recognized: ${symbol}${changeSummary.recognized_revenue.toFixed(2)}`,
      `Pending change settlements: ${symbol}${changeSummary.pending_settlements.toFixed(2)}`,
      "",
      "Regards,",
      "Digi-Tech Admin",
    ].join("\n");
    const mailtoLink = `mailto:${encodeURIComponent(recipients)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return res.json({ mailto_link: mailtoLink, recipients, currency });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    return res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((error, req, res, next) => {
  if (error && error.message && error.message.includes("CORS")) {
    return res.status(403).json({ error: "CORS origin blocked." });
  }
  return res.status(500).json({ error: "Internal server error" });
});

const initialize = async () => {
  await repo.init();
};

module.exports = { app, initialize };
