const projectsTableBody = document.getElementById("projects-table-body");
const totalProjectsEl = document.getElementById("total-projects");
const activeProjectsEl = document.getElementById("active-projects");
const completedProjectsEl = document.getElementById("completed-projects");
const completedRevenueEl = document.getElementById("completed-revenue");
const pendingPaymentsEl = document.getElementById("pending-payments");
const overduePaymentsEl = document.getElementById("overdue-payments");
const portfolioProgressEl = document.getElementById("portfolio-progress");
const deadlineListEl = document.getElementById("deadline-list");
const form = document.getElementById("project-form");
const formTitle = document.getElementById("form-title");
const formFeedback = document.getElementById("form-feedback");
const projectIdField = document.getElementById("project-id");
const saveProjectButton = document.getElementById("save-project-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const addMilestoneButton = document.getElementById("add-milestone");
const milestonesContainer = document.getElementById("milestones-container");
const milestoneTemplate = document.getElementById("milestone-template");
const shareForm = document.getElementById("share-form");
const shareResult = document.getElementById("share-result");
const dashboardCurrencySelect = document.getElementById("dashboard-currency");
const exportCsvLink = document.getElementById("export-csv-link");
const exportJsonLink = document.getElementById("export-json-link");
const openChangeRequestsEl = document.getElementById("open-change-requests");
const approvedChangeValueEl = document.getElementById("approved-change-value");
const changeRequestForm = document.getElementById("change-request-form");
const changeRequestFeedback = document.getElementById("change-request-feedback");
const changeRequestsTableBody = document.getElementById("change-requests-table-body");
const changeRequestIdField = document.getElementById("change-request-id");
const saveChangeRequestButton = document.getElementById("save-change-request-button");
const cancelChangeRequestButton = document.getElementById("cancel-change-request-button");
const changeRequestProjectField = document.getElementById("change-request-project-id");

let cachedProjects = [];
let cachedChangeRequests = [];

const formatterCache = new Map();
const getCurrencyFormatter = (currencyCode) => {
  const key = currencyCode || "USD";
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: key,
        minimumFractionDigits: 2,
      })
    );
  }
  return formatterCache.get(key);
};

const formatCurrency = (value, currencyCode) => getCurrencyFormatter(currencyCode).format(Number(value || 0));

const resolveDashboardCurrency = (overview, projects) => {
  if (overview?.currency) return overview.currency;
  const projectCurrencies = new Set(projects.map((project) => project.currency).filter(Boolean));
  if (projectCurrencies.size === 1) {
    return [...projectCurrencies][0];
  }
  return "USD";
};

const statusLabelMap = {
  planned: "Planned",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const changeRequestStatusLabelMap = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  rejected: "Rejected",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const parseJson = async (response) => {
  if (response.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
};

const updateExportLink = () => {
  const currency = dashboardCurrencySelect.value;
  exportCsvLink.href = currency ? `/api/admin/export.csv?currency=${encodeURIComponent(currency)}` : "/api/admin/export.csv";
  exportJsonLink.href = currency
    ? `/api/admin/export.json?currency=${encodeURIComponent(currency)}`
    : "/api/admin/export.json";
};

const resetFormToCreateMode = () => {
  form.reset();
  projectIdField.value = "";
  formTitle.textContent = "Add Project";
  saveProjectButton.textContent = "Save Project";
  cancelEditButton.hidden = true;
  milestonesContainer.innerHTML = "";
  createMilestoneItem();
};

const resetChangeRequestFormToCreateMode = () => {
  if (!changeRequestForm) return;
  changeRequestForm.reset();
  changeRequestIdField.value = "";
  saveChangeRequestButton.textContent = "Save Change Request";
  cancelChangeRequestButton.hidden = true;
};

const populateChangeRequestProjectOptions = () => {
  if (!changeRequestProjectField) return;
  const selectedValue = changeRequestProjectField.value;
  const options = cachedProjects
    .map(
      (project) =>
        `<option value="${project.id}">#${project.id} · ${escapeHtml(project.project_name)} (${escapeHtml(
          project.client_name
        )})</option>`
    )
    .join("");
  changeRequestProjectField.innerHTML = `<option value="">Select a project</option>${options}`;
  if (selectedValue && cachedProjects.some((project) => String(project.id) === String(selectedValue))) {
    changeRequestProjectField.value = selectedValue;
  }
};

const createMilestoneItem = (milestone = null) => {
  const content = milestoneTemplate.content.cloneNode(true);
  const item = content.querySelector(".milestone-item");
  const removeButton = content.querySelector(".remove-milestone");

  const titleField = content.querySelector("input[name='milestone_title']");
  const amountField = content.querySelector("input[name='milestone_amount']");
  const dueDateField = content.querySelector("input[name='milestone_due_date']");
  const paidField = content.querySelector("input[name='milestone_paid']");
  if (milestone) {
    titleField.value = milestone.title || "";
    amountField.value = milestone.amount ?? "";
    dueDateField.value = milestone.due_date || "";
    paidField.checked = Boolean(milestone.paid);
  }

  removeButton.addEventListener("click", () => item.remove());
  milestonesContainer.appendChild(content);
};

const collectMilestones = () => {
  const rows = Array.from(milestonesContainer.querySelectorAll(".milestone-item"));
  return rows
    .map((row) => ({
      title: row.querySelector("input[name='milestone_title']").value.trim(),
      amount: Number(row.querySelector("input[name='milestone_amount']").value),
      due_date: row.querySelector("input[name='milestone_due_date']").value,
      paid: row.querySelector("input[name='milestone_paid']").checked,
    }))
    .filter((milestone) => milestone.title && milestone.due_date && !Number.isNaN(milestone.amount));
};

const renderMilestoneRow = (milestone, currencyCode) => {
  const dueClass = milestone.paid ? "status-completed" : "status-upcoming";
  return `<span class="milestone-pill ${dueClass}">
      ${milestone.title} • ${formatCurrency(milestone.amount, currencyCode)} • ${milestone.due_date}
    </span>`;
};

const renderProjects = (projects, overview) => {
  if (!projects.length) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="7"><p class="empty-state">No projects found. Add one to start tracking.</p></td>
      </tr>
    `;
    return;
  }

  const totals = overview?.totals || {};
  const currencyCode = resolveDashboardCurrency(overview, projects);
  const totalContractValue =
    Number(totals.total_contract_value) || projects.reduce((sum, project) => sum + Number(project.total_price || 0), 0);
  const totalRevenueAmount =
    Number(totals.total_paid) || projects.reduce((sum, project) => sum + Number(project.paid_amount || 0), 0);
  const totalRemainingAmount =
    Number(totals.total_remaining) ||
    projects.reduce((sum, project) => sum + Number(project.metrics?.remaining_balance || 0), 0);

  const rowsHtml = projects
    .map((project) => {
      const metrics = project.metrics;
      const isCompleted = metrics.effective_status === "completed" || project.status === "completed";
      const displayDeadlineState = isCompleted ? "completed" : metrics.deadline_state;
      const displayDaysRemaining = isCompleted ? "Completed" : `${metrics.days_remaining} day(s) remaining`;
      const statusClass = `status-${metrics.effective_status}`;
      const deadlineClass = `status-${displayDeadlineState}`;
      const milestonesHtml = project.milestones.length
        ? project.milestones.map((milestone) => renderMilestoneRow(milestone, project.currency)).join("")
        : `<span class="empty-state">No milestones set.</span>`;

      return `
        <tr>
          <td>
            <p class="project-main">${project.client_name}</p>
            <p class="project-sub">ID #${project.id}</p>
          </td>
          <td>
            <p class="project-main">${project.project_name}</p>
            <p class="project-sub">Start: ${project.start_date}</p>
          </td>
          <td>
            <span class="status-badge ${statusClass}">
              ${statusLabelMap[metrics.effective_status] || metrics.effective_status}
            </span>
          </td>
          <td>
            <p class="project-main">${formatCurrency(project.paid_amount, project.currency)} / ${formatCurrency(project.total_price, project.currency)}</p>
            <p class="project-sub">Currency: ${project.currency} • Remaining: ${formatCurrency(metrics.remaining_balance, project.currency)}</p>
            <div class="progress-track"><div class="progress-fill" style="width:${metrics.payment_progress}%"></div></div>
            <p class="project-sub">${metrics.payment_progress}% paid</p>
          </td>
          <td>${milestonesHtml}</td>
          <td>
            <p class="project-main">${project.deadline}</p>
            <p class="project-sub">${displayDaysRemaining}</p>
            <span class="status-badge ${deadlineClass}">${displayDeadlineState.replace("_", " ")}</span>
          </td>
          <td>
            <div class="actions-cell">
              <button class="button ghost small edit-project" type="button" data-id="${project.id}">Edit</button>
              <button class="button danger small delete-project" type="button" data-id="${project.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const totalsRowHtml = `
    <tr class="totals-row">
      <td colspan="3">
        <p class="project-main">Portfolio Total</p>
        <p class="project-sub">${projects.length} project(s)</p>
      </td>
      <td>
        <p class="project-main">${formatCurrency(totalRevenueAmount, currencyCode)}</p>
        <p class="project-sub">Contracted: ${formatCurrency(totalContractValue, currencyCode)} • Remaining: ${formatCurrency(totalRemainingAmount, currencyCode)}</p>
      </td>
      <td colspan="3">
        <p class="project-sub">Revenues are counted from paid amounts only.</p>
      </td>
    </tr>
  `;

  projectsTableBody.innerHTML = rowsHtml + totalsRowHtml;
};

const renderChangeRequests = (changeRequests) => {
  if (!changeRequestsTableBody) return;
  if (!changeRequests.length) {
    changeRequestsTableBody.innerHTML = `
      <tr>
        <td colspan="6"><p class="empty-state">No change requests yet.</p></td>
      </tr>
    `;
    return;
  }

  const rowsHtml = changeRequests
    .map((changeRequest) => {
      const statusClass = `status-${changeRequest.status}`;
      const updatedAt = changeRequest.updated_at ? String(changeRequest.updated_at).slice(0, 10) : "-";
      const requestTitle = escapeHtml(changeRequest.title);
      const projectName = escapeHtml(changeRequest.project_name || `Project #${changeRequest.project_id}`);
      const clientName = escapeHtml(changeRequest.client_name || "");
      const description = changeRequest.description ? `<p class="project-sub">${escapeHtml(changeRequest.description)}</p>` : "";
      const currencyCode = changeRequest.currency || "USD";

      return `
        <tr>
          <td>
            <p class="project-main">${projectName}</p>
            <p class="project-sub">${clientName}</p>
          </td>
          <td>
            <p class="project-main">${requestTitle}</p>
            ${description}
          </td>
          <td>${formatCurrency(changeRequest.price, currencyCode)}</td>
          <td>
            <span class="status-badge ${statusClass}">
              ${changeRequestStatusLabelMap[changeRequest.status] || changeRequest.status}
            </span>
          </td>
          <td>${updatedAt}</td>
          <td>
            <div class="actions-cell">
              <button class="button ghost small email-change-request" type="button" data-id="${changeRequest.id}">Email Client</button>
              <button class="button ghost small edit-change-request" type="button" data-id="${changeRequest.id}">Edit</button>
              <button class="button danger small delete-change-request" type="button" data-id="${changeRequest.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  changeRequestsTableBody.innerHTML = rowsHtml;
};

const buildChangeRequestEmailDraft = (changeRequest) => {
  const statusLabel = changeRequestStatusLabelMap[changeRequest.status] || changeRequest.status;
  const currencyCode = changeRequest.currency || "USD";
  const priceText = formatCurrency(changeRequest.price, currencyCode);
  const etaLine =
    changeRequest.estimated_days === null || changeRequest.estimated_days === undefined
      ? ""
      : `Estimated timeline: ${changeRequest.estimated_days} day(s)\n`;
  const descriptionLine = changeRequest.description
    ? `Requested details:\n${changeRequest.description}\n\n`
    : "Requested details: No additional notes were provided.\n\n";
  const subject = `Change Request Update - ${changeRequest.project_name || `Project #${changeRequest.project_id}`}`;
  const body =
    `Hello ${changeRequest.client_name || "Client"},\n\n` +
    "Here is your change request summary:\n\n" +
    `Project: ${changeRequest.project_name || `Project #${changeRequest.project_id}`}\n` +
    `Request: ${changeRequest.title}\n` +
    `Status: ${statusLabel}\n` +
    `Price: ${priceText}\n` +
    etaLine +
    `Last updated: ${changeRequest.updated_at ? String(changeRequest.updated_at).slice(0, 10) : "-"}\n\n` +
    descriptionLine +
    "Please reply to confirm or request any adjustments.\n\n" +
    "Best regards,\nDigi-Tech";

  return { subject, body };
};

const renderOverview = (overview) => {
  const totals = overview.totals;
  const changeSummary = overview.change_requests_summary || {};
  const currencyCode = resolveDashboardCurrency(overview, cachedProjects);
  const totalRevenue =
    Number(totals.total_paid) || cachedProjects.reduce((sum, project) => sum + Number(project.paid_amount || 0), 0);
  const pendingBalance =
    Number(totals.total_remaining) ||
    cachedProjects.reduce((sum, project) => sum + Number(project.metrics?.remaining_balance || 0), 0);
  totalProjectsEl.textContent = totals.total_projects;
  activeProjectsEl.textContent = totals.active_projects;
  completedProjectsEl.textContent = totals.completed_projects;
  completedRevenueEl.textContent = formatCurrency(totalRevenue, currencyCode);
  pendingPaymentsEl.textContent = formatCurrency(pendingBalance, currencyCode);
  overduePaymentsEl.textContent = `${totals.overdue_payments_count} (${formatCurrency(totals.overdue_payments_amount, currencyCode)})`;
  portfolioProgressEl.textContent = `${totals.portfolio_payment_progress}%`;
  if (openChangeRequestsEl) {
    openChangeRequestsEl.textContent = String(changeSummary.open_requests || 0);
  }
  if (approvedChangeValueEl) {
    approvedChangeValueEl.textContent = formatCurrency(changeSummary.approved_value || 0, currencyCode);
  }

  if (!overview.upcoming_deadlines.length) {
    deadlineListEl.innerHTML = "<li>No deadlines in the next 14 days.</li>";
    return;
  }

  deadlineListEl.innerHTML = overview.upcoming_deadlines
    .map(
      (item) => `
      <li>
        <strong>${item.project_name}</strong> (${item.client_name})<br/>
        Due ${item.deadline} • ${item.days_remaining} day(s) left
      </li>
    `
    )
    .join("");
};

const fetchProjects = async () => {
  const currency = dashboardCurrencySelect.value;
  const url = currency ? `/api/admin/projects?currency=${encodeURIComponent(currency)}` : "/api/admin/projects";
  const response = await fetch(url);
  const payload = await parseJson(response);
  return payload.projects || [];
};

const fetchOverview = async () => {
  const currency = dashboardCurrencySelect.value;
  const url = currency ? `/api/admin/overview?currency=${encodeURIComponent(currency)}` : "/api/admin/overview";
  const response = await fetch(url);
  return parseJson(response);
};

const fetchChangeRequests = async () => {
  const currency = dashboardCurrencySelect.value;
  const url = currency
    ? `/api/admin/change-requests?currency=${encodeURIComponent(currency)}`
    : "/api/admin/change-requests";
  const response = await fetch(url);
  const payload = await parseJson(response);
  return payload.change_requests || [];
};

const refreshDashboard = async () => {
  updateExportLink();
  const [overview, projects, changeRequests] = await Promise.all([fetchOverview(), fetchProjects(), fetchChangeRequests()]);
  cachedProjects = projects;
  cachedChangeRequests = changeRequests;
  populateChangeRequestProjectOptions();
  renderOverview(overview);
  renderProjects(projects, overview);
  renderChangeRequests(changeRequests);
};

const enterEditMode = (projectId) => {
  const project = cachedProjects.find((item) => Number(item.id) === Number(projectId));
  if (!project) return;
  projectIdField.value = String(project.id);
  form.client_name.value = project.client_name;
  form.project_name.value = project.project_name;
  form.currency.value = project.currency;
  form.total_price.value = String(project.total_price);
  form.paid_amount.value = String(project.paid_amount);
  form.start_date.value = project.start_date;
  form.deadline.value = project.deadline;
  form.status.value = project.status;
  form.notes.value = project.notes || "";

  milestonesContainer.innerHTML = "";
  if (project.milestones.length) {
    project.milestones.forEach((milestone) => createMilestoneItem(milestone));
  } else {
    createMilestoneItem();
  }

  formTitle.textContent = "Edit Project";
  saveProjectButton.textContent = "Update Project";
  cancelEditButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
};

const deleteProject = async (projectId) => {
  const confirmed = window.confirm("Delete this project permanently?");
  if (!confirmed) return;
  try {
    const response = await fetch(`/api/admin/projects/${projectId}`, { method: "DELETE" });
    await parseJson(response);
    formFeedback.textContent = "Project deleted successfully.";
    formFeedback.className = "success";
    if (projectIdField.value && Number(projectIdField.value) === Number(projectId)) {
      resetFormToCreateMode();
    }
    await refreshDashboard();
  } catch (error) {
    formFeedback.textContent = error.message;
    formFeedback.className = "error";
  }
};

const enterChangeRequestEditMode = (changeRequestId) => {
  if (!changeRequestForm) return;
  const changeRequest = cachedChangeRequests.find((item) => Number(item.id) === Number(changeRequestId));
  if (!changeRequest) return;
  changeRequestIdField.value = String(changeRequest.id);
  changeRequestProjectField.value = String(changeRequest.project_id);
  changeRequestForm.title.value = changeRequest.title || "";
  changeRequestForm.price.value = String(changeRequest.price ?? 0);
  changeRequestForm.estimated_days.value = changeRequest.estimated_days ?? "";
  changeRequestForm.status.value = changeRequest.status || "draft";
  changeRequestForm.description.value = changeRequest.description || "";
  saveChangeRequestButton.textContent = "Update Change Request";
  cancelChangeRequestButton.hidden = false;
  changeRequestForm.scrollIntoView({ behavior: "smooth", block: "start" });
};

const deleteChangeRequest = async (changeRequestId) => {
  if (!changeRequestForm) return;
  const confirmed = window.confirm("Delete this change request permanently?");
  if (!confirmed) return;
  try {
    const response = await fetch(`/api/admin/change-requests/${changeRequestId}`, { method: "DELETE" });
    await parseJson(response);
    changeRequestFeedback.textContent = "Change request deleted successfully.";
    changeRequestFeedback.className = "success";
    if (changeRequestIdField.value && Number(changeRequestIdField.value) === Number(changeRequestId)) {
      resetChangeRequestFormToCreateMode();
    }
    await refreshDashboard();
  } catch (error) {
    changeRequestFeedback.textContent = error.message;
    changeRequestFeedback.className = "error";
  }
};

const emailChangeRequest = (changeRequestId) => {
  const changeRequest = cachedChangeRequests.find((item) => Number(item.id) === Number(changeRequestId));
  if (!changeRequest) return;

  const defaultRecipient = shareForm?.client_email?.value?.trim() || "";
  const recipient = window
    .prompt(`Enter ${changeRequest.client_name || "client"} email address:`, defaultRecipient)
    ?.trim();

  if (recipient === undefined) {
    return;
  }

  if (!recipient) {
    changeRequestFeedback.textContent = "Client email is required to open the draft.";
    changeRequestFeedback.className = "error";
    return;
  }

  if (shareForm?.client_email) {
    shareForm.client_email.value = recipient;
  }

  const { subject, body } = buildChangeRequestEmailDraft(changeRequest);
  const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formFeedback.className = "";
  formFeedback.textContent = "Saving project...";

  const payload = {
    client_name: form.client_name.value.trim(),
    project_name: form.project_name.value.trim(),
    currency: form.currency.value,
    total_price: Number(form.total_price.value),
    paid_amount: Number(form.paid_amount.value),
    start_date: form.start_date.value,
    deadline: form.deadline.value,
    status: form.status.value,
    notes: form.notes.value.trim(),
    milestones: collectMilestones(),
  };

  const editingProjectId = projectIdField.value;
  const isEditing = Boolean(editingProjectId);
  const endpoint = isEditing ? `/api/admin/projects/${editingProjectId}` : "/api/admin/projects";
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await parseJson(response);
    formFeedback.textContent = isEditing ? "Project updated successfully." : "Project saved successfully.";
    formFeedback.className = "success";
    resetFormToCreateMode();
    await refreshDashboard();
  } catch (error) {
    formFeedback.textContent = error.message;
    formFeedback.className = "error";
  }
});

projectsTableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-project");
  const deleteButton = event.target.closest(".delete-project");
  if (editButton) {
    enterEditMode(Number(editButton.dataset.id));
  }
  if (deleteButton) {
    deleteProject(Number(deleteButton.dataset.id));
  }
});

if (changeRequestForm) {
  changeRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    changeRequestFeedback.className = "";
    changeRequestFeedback.textContent = "Saving change request...";

    const payload = {
      project_id: Number(changeRequestForm.project_id.value),
      title: changeRequestForm.title.value.trim(),
      description: changeRequestForm.description.value.trim(),
      price: Number(changeRequestForm.price.value),
      estimated_days: changeRequestForm.estimated_days.value ? Number(changeRequestForm.estimated_days.value) : null,
      status: changeRequestForm.status.value,
    };

    const editingId = changeRequestIdField.value;
    const isEditing = Boolean(editingId);
    const endpoint = isEditing ? `/api/admin/change-requests/${editingId}` : "/api/admin/change-requests";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseJson(response);
      changeRequestFeedback.textContent = isEditing
        ? "Change request updated successfully."
        : "Change request created successfully.";
      changeRequestFeedback.className = "success";
      resetChangeRequestFormToCreateMode();
      await refreshDashboard();
    } catch (error) {
      changeRequestFeedback.textContent = error.message;
      changeRequestFeedback.className = "error";
    }
  });
}

if (changeRequestsTableBody) {
  changeRequestsTableBody.addEventListener("click", (event) => {
    const emailButton = event.target.closest(".email-change-request");
    const editButton = event.target.closest(".edit-change-request");
    const deleteButton = event.target.closest(".delete-change-request");
    if (emailButton) {
      emailChangeRequest(Number(emailButton.dataset.id));
    }
    if (editButton) {
      enterChangeRequestEditMode(Number(editButton.dataset.id));
    }
    if (deleteButton) {
      deleteChangeRequest(Number(deleteButton.dataset.id));
    }
  });
}

cancelEditButton.addEventListener("click", () => {
  resetFormToCreateMode();
  formFeedback.textContent = "Edit cancelled.";
  formFeedback.className = "";
});

if (cancelChangeRequestButton) {
  cancelChangeRequestButton.addEventListener("click", () => {
    resetChangeRequestFormToCreateMode();
    changeRequestFeedback.textContent = "Edit cancelled.";
    changeRequestFeedback.className = "";
  });
}

addMilestoneButton.addEventListener("click", () => createMilestoneItem());

dashboardCurrencySelect.addEventListener("change", async () => {
  try {
    await refreshDashboard();
  } catch (error) {
    formFeedback.textContent = error.message;
    formFeedback.className = "error";
  }
});

shareForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    client_email: shareForm.client_email.value.trim(),
    admin_email: shareForm.admin_email.value.trim(),
    currency: dashboardCurrencySelect.value || null,
  };
  shareResult.textContent = "Generating email draft...";
  try {
    const response = await fetch("/api/admin/share-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await parseJson(response);
    shareResult.innerHTML = `
      <p>Draft ready for: <strong>${body.recipients}</strong></p>
      <a href="${body.mailto_link}">Open email draft</a>
    `;
  } catch (error) {
    shareResult.textContent = error.message;
  }
});

resetFormToCreateMode();
resetChangeRequestFormToCreateMode();
refreshDashboard().catch((error) => {
  formFeedback.textContent = error.message;
  formFeedback.className = "error";
});
