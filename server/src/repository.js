const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const ALLOWED_PROJECT_STATUSES = new Set(["planned", "in_progress", "on_hold", "completed", "cancelled"]);
const ALLOWED_CHANGE_REQUEST_STATUSES = new Set([
  "draft",
  "sent",
  "approved",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
]);
const ALLOWED_CURRENCIES = new Set(["USD", "EGP"]);

const parseDate = (value, fieldLabel = "date") => {
  const raw = String(value || "").trim();
  if (!raw) {
    throw new Error(`${fieldLabel} is required.`);
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldLabel}. Expected YYYY-MM-DD format.`);
  }
  return raw;
};

const parseOptionalDate = (value, fieldLabel = "date") => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  return parseDate(raw, fieldLabel);
};

const toDate = (value) => new Date(`${value}T00:00:00Z`);

const todayDate = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const toAmount = (value, label = "amount") => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) {
    throw new Error(`${label} must be a valid number.`);
  }
  return Math.round(amount * 100) / 100;
};

const normalizeProjectStatus = (value) => {
  const status = String(value || "").trim();
  if (!ALLOWED_PROJECT_STATUSES.has(status)) {
    throw new Error(`Invalid project status: ${status}`);
  }
  return status;
};

const normalizeChangeRequestStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();
  if (!ALLOWED_CHANGE_REQUEST_STATUSES.has(status)) {
    throw new Error(`Invalid change request status: ${status}`);
  }
  return status;
};

const normalizeCurrency = (value) => {
  const currency = String(value || "").trim().toUpperCase();
  if (!ALLOWED_CURRENCIES.has(currency)) {
    throw new Error("Currency must be USD or EGP.");
  }
  return currency;
};

const sanitizeMilestones = (milestones, startDate, deadline, totalPrice) => {
  if (!Array.isArray(milestones)) return [];
  const start = toDate(startDate);
  const end = toDate(deadline);
  let totalMilestones = 0;
  const cleaned = [];

  for (const milestone of milestones) {
    const title = String(milestone?.title || "").trim();
    const dueDate = String(milestone?.due_date || "").trim();
    if (!title || !dueDate) continue;
    parseDate(dueDate, "milestone due date");
    const due = toDate(dueDate);
    if (due < start || due > end) {
      throw new Error("Milestone due date must be between start and deadline.");
    }
    const amount = toAmount(milestone?.amount ?? 0, "milestone amount");
    if (amount < 0) throw new Error("Milestone amount must be positive.");
    totalMilestones += amount;
    cleaned.push({
      title,
      amount,
      due_date: dueDate,
      paid: Boolean(milestone?.paid),
    });
  }

  if (totalMilestones > totalPrice) {
    throw new Error("Milestone total cannot exceed project total price.");
  }
  cleaned.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return cleaned;
};

const computeProjectMetrics = (project) => {
  const total = Number(project.total_price);
  const paid = Number(project.paid_amount);
  const remaining = Math.max(total - paid, 0);
  const paymentProgress = total <= 0 ? 0 : Math.min((paid / total) * 100, 100);

  const deadline = toDate(project.deadline);
  const daysRemaining = Math.floor((deadline - todayDate()) / (1000 * 60 * 60 * 24));
  let deadlineState = "on_track";
  if (daysRemaining < 0) deadlineState = "overdue";
  else if (daysRemaining <= 14) deadlineState = "upcoming";

  let effectiveStatus = project.status;
  if (remaining <= 0 && effectiveStatus !== "cancelled") {
    effectiveStatus = "completed";
  }

  if (effectiveStatus === "completed") {
    return {
      remaining_balance: Number(remaining.toFixed(2)),
      payment_progress: Number(paymentProgress.toFixed(2)),
      days_remaining: daysRemaining,
      deadline_state: "completed",
      pending_milestones_count: 0,
      pending_milestones_amount: 0,
      overdue_milestones_count: 0,
      overdue_milestones_amount: 0,
      next_due_milestone: null,
      effective_status: effectiveStatus,
    };
  }

  let pendingCount = 0;
  let pendingAmount = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  const unpaid = (project.milestones || []).filter((m) => !m.paid);
  for (const milestone of unpaid) {
    const due = toDate(milestone.due_date);
    if (due < todayDate()) {
      overdueCount += 1;
      overdueAmount += Number(milestone.amount);
    } else {
      pendingCount += 1;
      pendingAmount += Number(milestone.amount);
    }
  }
  const nextDue = unpaid.length ? [...unpaid].sort((a, b) => a.due_date.localeCompare(b.due_date))[0] : null;

  return {
    remaining_balance: Number(remaining.toFixed(2)),
    payment_progress: Number(paymentProgress.toFixed(2)),
    days_remaining: daysRemaining,
    deadline_state: deadlineState,
    pending_milestones_count: pendingCount,
    pending_milestones_amount: Number(pendingAmount.toFixed(2)),
    overdue_milestones_count: overdueCount,
    overdue_milestones_amount: Number(overdueAmount.toFixed(2)),
    next_due_milestone: nextDue,
    effective_status: effectiveStatus,
  };
};

const computeChangeRequestMetrics = (changeRequest) => {
  const totalPrice = Number(changeRequest.price);
  const deposit = Math.min(Math.max(Number(changeRequest.deposit_amount || 0), 0), totalPrice);
  const remaining = Math.max(totalPrice - deposit, 0);
  const status = String(changeRequest.status);
  const depositRecognized = ["approved", "in_progress", "completed"].includes(status) ? deposit : 0;

  const startDate = changeRequest.start_date ? toDate(changeRequest.start_date) : null;
  const deadlineDate = changeRequest.deadline ? toDate(changeRequest.deadline) : null;
  const now = todayDate();
  const daysUntilStart = startDate ? Math.floor((startDate - now) / (1000 * 60 * 60 * 24)) : null;
  const daysRemaining = deadlineDate ? Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24)) : null;

  let timelineState = "on_track";
  if (status === "completed") timelineState = "completed";
  else if (daysRemaining !== null && daysRemaining < 0) timelineState = "overdue";
  else if (daysRemaining !== null && daysRemaining <= 7) timelineState = "upcoming";

  const finalRevenueEligible = status === "completed" && (!deadlineDate || deadlineDate <= now);
  const finalRevenueRecognized = finalRevenueEligible ? remaining : 0;
  const recognized = depositRecognized + finalRevenueRecognized;

  return {
    remaining_amount: Number(remaining.toFixed(2)),
    deposit_recognized: Number(depositRecognized.toFixed(2)),
    final_revenue_recognized: Number(finalRevenueRecognized.toFixed(2)),
    recognized_revenue: Number(recognized.toFixed(2)),
    settlement_pending: Number(Math.max(totalPrice - recognized, 0).toFixed(2)),
    days_until_start: daysUntilStart,
    days_remaining: daysRemaining,
    timeline_state: timelineState,
    final_revenue_eligible: finalRevenueEligible,
  };
};

const COLLECTIONS = {
  projects: "projects",
  adminUsers: "admin_users",
  inquiries: "inquiries",
  changeRequests: "change_requests",
  counters: "counters",
};

const nowIso = () => new Date().toISOString();

// Hosting-panel env editors commonly keep surrounding quotes or the pasted
// "KEY=" prefix, which the driver rejects with an opaque scheme error.
const normalizeMongoUri = (value) => {
  let uri = String(value ?? "").trim();
  uri = uri.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
  uri = uri.replace(/^MONGODB_URI\s*=\s*/i, "").trim();
  uri = uri.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();

  if (!uri) {
    throw new Error("MONGODB_URI is required. Set it in server/.env or your host's environment variables.");
  }
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    // Only echo the part before the credentials so the password never reaches a log.
    const prefix = uri.slice(0, Math.min(uri.indexOf("://") + 3 || 12, 12));
    throw new Error(
      `MONGODB_URI must start with "mongodb://" or "mongodb+srv://" but starts with "${prefix}". ` +
        "Set the value to the connection string only, with no variable name, quotes, or trailing text."
    );
  }

  // Atlas hands out a template containing <db_password>; catching it here beats
  // debugging the driver's generic "bad auth" rejection.
  const credentials = (uri.match(/^mongodb(?:\+srv)?:\/\/([^@]*)@/) || [])[1];
  if (credentials !== undefined) {
    const [, password = ""] = credentials.split(":");
    if (/[<>]/.test(credentials)) {
      throw new Error(
        "MONGODB_URI still contains a placeholder in angle brackets (such as <db_password>). " +
          "Replace it with the real database user password."
      );
    }
    if (["PASSWORD", "YOUR_PASSWORD", "db_password"].includes(password)) {
      throw new Error(
        `MONGODB_URI password is still the placeholder "${password}". Replace it with the real database user password.`
      );
    }
  }
  return uri;
};

class DashboardRepository {
  constructor({ uri, dbName, adminEmail, adminPassword }) {
    this.dbName = dbName;
    this.adminEmail = adminEmail;
    this.adminPassword = adminPassword;
    this.client = new MongoClient(normalizeMongoUri(uri));
    this.db = null;
  }

  collection(name) {
    if (!this.db) throw new Error("Database connection is not initialized.");
    return this.db.collection(name);
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db(this.dbName || undefined);
    await this.ensureIndexes();
    await this.ensureDefaultAdmin();
  }

  async close() {
    await this.client.close();
  }

  async ensureIndexes() {
    await Promise.all([
      this.collection(COLLECTIONS.adminUsers).createIndex({ email: 1 }, { unique: true }),
      this.collection(COLLECTIONS.projects).createIndex({ deadline: 1 }),
      this.collection(COLLECTIONS.projects).createIndex({ currency: 1 }),
      this.collection(COLLECTIONS.changeRequests).createIndex({ project_id: 1 }),
      this.collection(COLLECTIONS.changeRequests).createIndex({ created_at: -1 }),
    ]);
  }

  // Sequential numeric ids keep the public API shape identical to the previous SQLite schema.
  async nextId(sequenceName) {
    const result = await this.collection(COLLECTIONS.counters).findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    const doc = result?.value ?? result;
    return Number(doc.seq);
  }

  async ensureDefaultAdmin() {
    const existing = await this.collection(COLLECTIONS.adminUsers).findOne({ email: this.adminEmail });
    if (existing) return;
    await this.collection(COLLECTIONS.adminUsers).insertOne({
      _id: await this.nextId("admin_users"),
      email: this.adminEmail,
      password_hash: bcrypt.hashSync(this.adminPassword, 10),
      is_active: true,
      created_at: nowIso(),
      last_login_at: null,
    });
  }

  async authenticateAdmin(email, password) {
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized || !password) return null;
    const user = await this.collection(COLLECTIONS.adminUsers).findOne({ email: normalized });
    if (!user || !user.is_active) return null;
    if (!bcrypt.compareSync(password, user.password_hash)) return null;
    await this.collection(COLLECTIONS.adminUsers).updateOne(
      { _id: user._id },
      { $set: { last_login_at: nowIso() } }
    );
    return { id: user._id, email: user.email };
  }

  serializeProjectRow(doc) {
    const project = {
      id: doc._id,
      client_name: doc.client_name,
      project_name: doc.project_name,
      currency: doc.currency,
      total_price: Number(Number(doc.total_price).toFixed(2)),
      paid_amount: Number(Number(doc.paid_amount).toFixed(2)),
      start_date: doc.start_date,
      deadline: doc.deadline,
      status: doc.status,
      notes: doc.notes ?? null,
      milestones: Array.isArray(doc.milestones) ? doc.milestones : [],
    };
    project.metrics = computeProjectMetrics(project);
    return project;
  }

  async listProjects(currencyFilter = null) {
    const filter = currencyFilter ? { currency: currencyFilter } : {};
    const docs = await this.collection(COLLECTIONS.projects)
      .find(filter)
      .sort({ deadline: 1, _id: -1 })
      .toArray();
    return docs.map((doc) => this.serializeProjectRow(doc));
  }

  async getProject(projectId) {
    const doc = await this.collection(COLLECTIONS.projects).findOne({ _id: Number(projectId) });
    if (!doc) throw new Error("Project not found");
    return this.serializeProjectRow(doc);
  }

  async createProject(payload) {
    const clientName = String(payload.client_name || "").trim();
    const projectName = String(payload.project_name || "").trim();
    if (!clientName || !projectName) {
      throw new Error("client_name and project_name are required.");
    }
    const currency = normalizeCurrency(payload.currency || "USD");
    const status = normalizeProjectStatus(payload.status);
    const totalPrice = toAmount(payload.total_price, "total price");
    const paidAmount = toAmount(payload.paid_amount ?? 0, "paid amount");
    const startDate = parseDate(payload.start_date, "start date");
    const deadline = parseDate(payload.deadline, "deadline");
    if (toDate(deadline) < toDate(startDate)) throw new Error("Deadline cannot be before start date.");
    if (paidAmount > totalPrice) throw new Error("Paid amount cannot exceed total price.");
    const notes = String(payload.notes || "").trim() || null;
    const milestones = sanitizeMilestones(payload.milestones || [], startDate, deadline, totalPrice);

    const id = await this.nextId("projects");
    const timestamp = nowIso();
    await this.collection(COLLECTIONS.projects).insertOne({
      _id: id,
      client_name: clientName,
      project_name: projectName,
      currency,
      total_price: totalPrice,
      paid_amount: paidAmount,
      start_date: startDate,
      deadline,
      status,
      notes,
      milestones,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return this.getProject(id);
  }

  async updateProject(projectId, payload) {
    const existing = await this.getProject(projectId);
    const merged = {
      client_name: payload.client_name ?? existing.client_name,
      project_name: payload.project_name ?? existing.project_name,
      currency: payload.currency ?? existing.currency,
      total_price: payload.total_price ?? existing.total_price,
      paid_amount: payload.paid_amount ?? existing.paid_amount,
      start_date: payload.start_date ?? existing.start_date,
      deadline: payload.deadline ?? existing.deadline,
      status: payload.status ?? existing.status,
      notes: payload.notes ?? existing.notes ?? "",
      milestones: payload.milestones ?? existing.milestones,
    };
    const clientName = String(merged.client_name || "").trim();
    const projectName = String(merged.project_name || "").trim();
    const currency = normalizeCurrency(merged.currency);
    const status = normalizeProjectStatus(merged.status);
    const totalPrice = toAmount(merged.total_price, "total price");
    const paidAmount = toAmount(merged.paid_amount, "paid amount");
    const startDate = parseDate(merged.start_date, "start date");
    const deadline = parseDate(merged.deadline, "deadline");
    if (toDate(deadline) < toDate(startDate)) throw new Error("Deadline cannot be before start date.");
    if (paidAmount > totalPrice) throw new Error("Paid amount cannot exceed total price.");
    const notes = String(merged.notes || "").trim() || null;
    const milestones = sanitizeMilestones(merged.milestones || [], startDate, deadline, totalPrice);

    await this.collection(COLLECTIONS.projects).updateOne(
      { _id: Number(projectId) },
      {
        $set: {
          client_name: clientName,
          project_name: projectName,
          currency,
          total_price: totalPrice,
          paid_amount: paidAmount,
          start_date: startDate,
          deadline,
          status,
          notes,
          milestones,
          updated_at: nowIso(),
        },
      }
    );
    return this.getProject(projectId);
  }

  async deleteProject(projectId) {
    const id = Number(projectId);
    await this.collection(COLLECTIONS.changeRequests).deleteMany({ project_id: id });
    await this.collection(COLLECTIONS.projects).deleteOne({ _id: id });
  }

  async createInquiry(payload) {
    const fullName = String(payload.full_name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const company = String(payload.company || "").trim() || null;
    const message = String(payload.message || "").trim();
    if (!fullName || !email || !message) {
      throw new Error("full_name, email, and message are required.");
    }
    const doc = {
      _id: await this.nextId("inquiries"),
      full_name: fullName,
      email,
      company,
      message,
      created_at: nowIso(),
    };
    await this.collection(COLLECTIONS.inquiries).insertOne(doc);
    const { _id, ...rest } = doc;
    return { id: _id, ...rest };
  }

  serializeChangeRequestRow(doc) {
    const project = doc.project || {};
    const changeRequest = {
      id: doc._id,
      project_id: doc.project_id,
      project_name: project.project_name || null,
      client_name: project.client_name || null,
      currency: project.currency || null,
      title: doc.title,
      description: doc.description ?? null,
      requested_scope: Array.isArray(doc.requested_scope) ? doc.requested_scope : [],
      price: Number(Number(doc.price).toFixed(2)),
      deposit_amount: Number(Number(doc.deposit_amount || 0).toFixed(2)),
      start_date: doc.start_date ?? null,
      deadline: doc.deadline ?? null,
      estimated_days: doc.estimated_days === null || doc.estimated_days === undefined ? null : Number(doc.estimated_days),
      status: doc.status,
      requested_at: doc.requested_at,
      approved_at: doc.approved_at ?? null,
      completed_at: doc.completed_at ?? null,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
    changeRequest.metrics = computeChangeRequestMetrics(changeRequest);
    return changeRequest;
  }

  async listChangeRequests({ projectId = null, status = null, currency = null, changeRequestId = null } = {}) {
    const match = {};
    if (projectId !== null) match.project_id = Number(projectId);
    if (status) match.status = status;
    if (changeRequestId !== null) match._id = Number(changeRequestId);

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: COLLECTIONS.projects,
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
    ];
    if (currency) pipeline.push({ $match: { "project.currency": currency } });
    pipeline.push({ $sort: { created_at: -1, _id: -1 } });

    const docs = await this.collection(COLLECTIONS.changeRequests).aggregate(pipeline).toArray();
    return docs.map((doc) => this.serializeChangeRequestRow(doc));
  }

  async getChangeRequest(changeRequestId) {
    const [item] = await this.listChangeRequests({ changeRequestId });
    if (!item) throw new Error("Change request not found");
    return item;
  }

  async createChangeRequest(payload) {
    const projectId = Number(payload.project_id);
    if (!projectId) throw new Error("project_id is required.");
    await this.getProject(projectId);
    const title = String(payload.title || "").trim();
    if (!title) throw new Error("Change request title is required.");
    const description = String(payload.description || "").trim() || null;
    const requestedScope = Array.isArray(payload.requested_scope) ? payload.requested_scope : [];
    const price = toAmount(payload.price ?? 0, "change request price");
    if (price < 0) throw new Error("Change request price must be positive.");
    const depositAmount = toAmount(payload.deposit_amount ?? 0, "deposit");
    if (depositAmount < 0 || depositAmount > price) throw new Error("Deposit must be between 0 and total price.");
    const startDate = parseOptionalDate(payload.start_date, "start date");
    const deadline = parseOptionalDate(payload.deadline, "deadline");
    if ((startDate && !deadline) || (!startDate && deadline)) {
      throw new Error("Provide both start_date and deadline together.");
    }
    if (startDate && deadline && toDate(deadline) < toDate(startDate)) {
      throw new Error("Deadline cannot be before start date.");
    }
    const estimatedDays = payload.estimated_days === null || payload.estimated_days === undefined || payload.estimated_days === ""
      ? null
      : Number(payload.estimated_days);
    if (estimatedDays !== null && (Number.isNaN(estimatedDays) || estimatedDays < 0)) {
      throw new Error("estimated_days must be greater than or equal to zero.");
    }
    const status = normalizeChangeRequestStatus(payload.status || "draft");
    const timestamp = nowIso();
    const approvedAt = ["approved", "in_progress", "completed"].includes(status) ? timestamp : null;
    const completedAt = status === "completed" ? timestamp : null;

    const id = await this.nextId("change_requests");
    await this.collection(COLLECTIONS.changeRequests).insertOne({
      _id: id,
      project_id: projectId,
      title,
      description,
      requested_scope: requestedScope,
      price,
      deposit_amount: depositAmount,
      start_date: startDate,
      deadline,
      estimated_days: estimatedDays,
      status,
      requested_at: timestamp,
      approved_at: approvedAt,
      completed_at: completedAt,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return this.getChangeRequest(id);
  }

  async updateChangeRequest(changeRequestId, payload) {
    const existing = await this.getChangeRequest(changeRequestId);
    const projectId = Number(payload.project_id ?? existing.project_id);
    await this.getProject(projectId);
    const title = String(payload.title ?? existing.title).trim();
    if (!title) throw new Error("Change request title is required.");
    const description = String(payload.description ?? existing.description ?? "").trim() || null;
    const requestedScope = Array.isArray(payload.requested_scope) ? payload.requested_scope : existing.requested_scope;
    const price = toAmount(payload.price ?? existing.price, "change request price");
    const depositAmount = toAmount(payload.deposit_amount ?? existing.deposit_amount, "deposit");
    if (depositAmount < 0 || depositAmount > price) throw new Error("Deposit must be between 0 and total price.");

    const startDate = payload.start_date !== undefined ? parseOptionalDate(payload.start_date, "start date") : existing.start_date;
    const deadline = payload.deadline !== undefined ? parseOptionalDate(payload.deadline, "deadline") : existing.deadline;
    if ((startDate && !deadline) || (!startDate && deadline)) {
      throw new Error("Provide both start_date and deadline together.");
    }
    if (startDate && deadline && toDate(deadline) < toDate(startDate)) {
      throw new Error("Deadline cannot be before start date.");
    }

    const estimatedDays = payload.estimated_days !== undefined
      ? (payload.estimated_days === null || payload.estimated_days === "" ? null : Number(payload.estimated_days))
      : existing.estimated_days;
    if (estimatedDays !== null && (Number.isNaN(estimatedDays) || estimatedDays < 0)) {
      throw new Error("estimated_days must be greater than or equal to zero.");
    }
    const status = normalizeChangeRequestStatus(payload.status ?? existing.status);
    let approvedAt = existing.approved_at;
    let completedAt = existing.completed_at;
    const timestamp = nowIso();
    if (["approved", "in_progress", "completed"].includes(status) && !approvedAt) approvedAt = timestamp;
    completedAt = status === "completed" ? (completedAt || timestamp) : null;

    await this.collection(COLLECTIONS.changeRequests).updateOne(
      { _id: Number(changeRequestId) },
      {
        $set: {
          project_id: projectId,
          title,
          description,
          requested_scope: requestedScope || [],
          price,
          deposit_amount: depositAmount,
          start_date: startDate,
          deadline,
          estimated_days: estimatedDays,
          status,
          approved_at: approvedAt,
          completed_at: completedAt,
          updated_at: timestamp,
        },
      }
    );
    return this.getChangeRequest(changeRequestId);
  }

  async deleteChangeRequest(changeRequestId) {
    await this.collection(COLLECTIONS.changeRequests).deleteOne({ _id: Number(changeRequestId) });
  }
}

const buildOverview = (projects, changeRequests, currency = null) => {
  const totals = {
    total_projects: projects.length,
    active_projects: 0,
    completed_projects: 0,
    completed_revenue: 0,
    pending_payments_count: 0,
    pending_payments_amount: 0,
    overdue_payments_count: 0,
    overdue_payments_amount: 0,
    upcoming_deadlines_count: 0,
    total_contract_value: 0,
    total_paid: 0,
    total_remaining: 0,
    portfolio_payment_progress: 0,
    total_revenue_with_addons: 0,
    completed_revenue_with_addons: 0,
  };
  const upcomingDeadlines = [];
  for (const project of projects) {
    const metrics = project.metrics;
    totals.total_contract_value += Number(project.total_price);
    totals.total_paid += Number(project.paid_amount);
    totals.total_remaining += Number(metrics.remaining_balance);

    if (metrics.effective_status === "completed") {
      totals.completed_projects += 1;
      totals.completed_revenue += Number(project.paid_amount);
    } else if (metrics.effective_status !== "cancelled") {
      totals.active_projects += 1;
    }
    totals.pending_payments_count += Number(metrics.pending_milestones_count);
    totals.pending_payments_amount += Number(metrics.pending_milestones_amount);
    totals.overdue_payments_count += Number(metrics.overdue_milestones_count);
    totals.overdue_payments_amount += Number(metrics.overdue_milestones_amount);
    if (metrics.days_remaining >= 0 && metrics.days_remaining <= 14 && metrics.effective_status !== "completed") {
      totals.upcoming_deadlines_count += 1;
      upcomingDeadlines.push({
        project_id: project.id,
        project_name: project.project_name,
        client_name: project.client_name,
        deadline: project.deadline,
        days_remaining: metrics.days_remaining,
      });
    }
  }
  if (totals.total_contract_value > 0) {
    totals.portfolio_payment_progress = Number(((totals.total_paid / totals.total_contract_value) * 100).toFixed(2));
  }

  let openRequests = 0;
  let approvedValue = 0;
  let pendingValue = 0;
  let collectedRevenue = 0;
  let depositCollected = 0;
  let recognizedRevenue = 0;
  let pendingSettlements = 0;
  for (const request of changeRequests) {
    const status = request.status;
    const price = Number(request.price);
    const metrics = request.metrics || computeChangeRequestMetrics(request);
    if (!["completed", "rejected", "cancelled"].includes(status)) openRequests += 1;
    if (["approved", "in_progress", "completed"].includes(status)) approvedValue += price;
    if (["approved", "in_progress"].includes(status)) pendingValue += price;
    if (status === "completed") collectedRevenue += price;
    depositCollected += Number(metrics.deposit_recognized);
    recognizedRevenue += Number(metrics.recognized_revenue);
    pendingSettlements += Number(metrics.settlement_pending);
  }

  totals.total_revenue_with_addons = Number((totals.total_paid + recognizedRevenue).toFixed(2));
  totals.completed_revenue_with_addons = Number((totals.completed_revenue + recognizedRevenue).toFixed(2));

  const roundedKeys = [
    "completed_revenue",
    "pending_payments_amount",
    "overdue_payments_amount",
    "total_contract_value",
    "total_paid",
    "total_remaining",
    "total_revenue_with_addons",
    "completed_revenue_with_addons",
  ];
  for (const key of roundedKeys) {
    totals[key] = Number(Number(totals[key]).toFixed(2));
  }

  const summary = {
    total_requests: changeRequests.length,
    open_requests: openRequests,
    approved_value: Number(approvedValue.toFixed(2)),
    pending_value: Number(pendingValue.toFixed(2)),
    collected_revenue: Number(collectedRevenue.toFixed(2)),
    deposit_collected: Number(depositCollected.toFixed(2)),
    recognized_revenue: Number(recognizedRevenue.toFixed(2)),
    pending_settlements: Number(pendingSettlements.toFixed(2)),
  };

  return {
    currency,
    totals,
    upcoming_deadlines: upcomingDeadlines,
    change_requests_summary: summary,
  };
};

const serializeCsv = (projects) => {
  const lines = [
    [
      "Project ID",
      "Client Name",
      "Project Name",
      "Currency",
      "Status",
      "Start Date",
      "Deadline",
      "Total Price",
      "Paid Amount",
      "Remaining Balance",
      "Payment Progress (%)",
      "Pending Milestones",
      "Overdue Milestones",
    ].join(","),
  ];
  for (const project of projects) {
    const metrics = project.metrics;
    lines.push(
      [
        project.id,
        `"${project.client_name.replaceAll('"', '""')}"`,
        `"${project.project_name.replaceAll('"', '""')}"`,
        project.currency,
        metrics.effective_status,
        project.start_date,
        project.deadline,
        Number(project.total_price).toFixed(2),
        Number(project.paid_amount).toFixed(2),
        Number(metrics.remaining_balance).toFixed(2),
        Number(metrics.payment_progress).toFixed(2),
        metrics.pending_milestones_count,
        metrics.overdue_milestones_count,
      ].join(",")
    );
  }
  return lines.join("\n");
};

module.exports = {
  DashboardRepository,
  buildOverview,
  serializeCsv,
  normalizeCurrency,
  normalizeChangeRequestStatus,
  normalizeMongoUri,
};
