const projectsTableBody = document.getElementById("projects-table-body");
const activeProjectsEl = document.getElementById("active-projects");
const completedProjectsEl = document.getElementById("completed-projects");
const pendingPaymentsEl = document.getElementById("pending-payments");
const overduePaymentsEl = document.getElementById("overdue-payments");
const upcomingDeadlinesEl = document.getElementById("upcoming-deadlines");
const portfolioProgressEl = document.getElementById("portfolio-progress");
const deadlineListEl = document.getElementById("deadline-list");
const form = document.getElementById("project-form");
const formFeedback = document.getElementById("form-feedback");
const shareForm = document.getElementById("share-form");
const shareResult = document.getElementById("share-result");
const addMilestoneButton = document.getElementById("add-milestone");
const milestonesContainer = document.getElementById("milestones-container");
const milestoneTemplate = document.getElementById("milestone-template");
const dashboardCurrencySelect = document.getElementById("dashboard-currency");
const projectCurrencySelect = document.getElementById("project-currency");
const exportCsvLink = document.getElementById("export-csv-link");
const exportJsonLink = document.getElementById("export-json-link");

const formatterCache = new Map();
const getCurrencyFormatter = (currencyCode) => {
  if (!formatterCache.has(currencyCode)) {
    formatterCache.set(
      currencyCode,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
      })
    );
  }
  return formatterCache.get(currencyCode);
};

const formatCurrency = (value, currencyCode) => getCurrencyFormatter(currencyCode).format(Number(value || 0));

const statusLabelMap = {
  planned: "Planned",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const updateExportLinks = () => {
  const currency = dashboardCurrencySelect.value;
  exportCsvLink.href = `/api/admin/export.csv?currency=${encodeURIComponent(currency)}`;
  exportJsonLink.href = `/api/admin/export.json?currency=${encodeURIComponent(currency)}`;
};

const renderMilestoneRow = (milestone, currencyCode) => {
  const dueClass = milestone.paid ? "status-completed" : "status-upcoming";
  return `<span class="milestone-pill ${dueClass}">
      ${milestone.title} • ${formatCurrency(milestone.amount, currencyCode)} • ${milestone.due_date}
    </span>`;
};

const renderProjects = (projects) => {
  if (!projects.length) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="6"><p class="empty-state">No projects in this currency yet. Add one to start tracking.</p></td>
      </tr>
    `;
    return;
  }

  projectsTableBody.innerHTML = projects
    .map((project) => {
      const metrics = project.metrics;
      const statusClass = `status-${metrics.effective_status}`;
      const deadlineClass = `status-${metrics.deadline_state}`;
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
            <div class="progress-track"><div class="progress-fill" style="width: ${metrics.payment_progress}%;"></div></div>
            <p class="project-sub">${metrics.payment_progress}% paid</p>
          </td>
          <td>${milestonesHtml}</td>
          <td>
            <p class="project-main">${project.deadline}</p>
            <p class="project-sub">${metrics.days_remaining} day(s) remaining</p>
            <span class="status-badge ${deadlineClass}">${metrics.deadline_state.replace("_", " ")}</span>
          </td>
        </tr>
      `;
    })
    .join("");
};

const renderOverview = (overview) => {
  const totals = overview.totals;
  const currency = overview.currency || dashboardCurrencySelect.value;
  activeProjectsEl.textContent = totals.active_projects;
  completedProjectsEl.textContent = totals.completed_projects;
  pendingPaymentsEl.textContent = `${totals.pending_payments_count} (${formatCurrency(totals.pending_payments_amount, currency)})`;
  overduePaymentsEl.textContent = `${totals.overdue_payments_count} (${formatCurrency(totals.overdue_payments_amount, currency)})`;
  upcomingDeadlinesEl.textContent = totals.upcoming_deadlines_count;
  portfolioProgressEl.textContent = `${totals.portfolio_payment_progress}%`;

  if (!overview.upcoming_deadlines.length) {
    deadlineListEl.innerHTML = `<li>No ${currency} deadlines in the next 14 days.</li>`;
    return;
  }

  deadlineListEl.innerHTML = overview.upcoming_deadlines
    .map(
      (item) => `
      <li>
        <strong>${item.project_name}</strong> (${item.client_name})<br />
        Due ${item.deadline} • ${item.days_remaining} day(s) left
      </li>
    `
    )
    .join("");
};

const fetchOverview = async (currency) => {
  const response = await fetch(`/api/admin/overview?currency=${encodeURIComponent(currency)}`);
  if (!response.ok) {
    throw new Error("Unable to load dashboard overview.");
  }
  return response.json();
};

const fetchProjects = async (currency) => {
  const response = await fetch(`/api/admin/projects?currency=${encodeURIComponent(currency)}`);
  if (!response.ok) {
    throw new Error("Unable to load projects.");
  }
  const payload = await response.json();
  return payload.projects || [];
};

const createMilestoneItem = () => {
  const content = milestoneTemplate.content.cloneNode(true);
  const item = content.querySelector(".milestone-item");
  const removeButton = content.querySelector(".remove-milestone");
  removeButton.addEventListener("click", () => {
    item.remove();
  });
  milestonesContainer.appendChild(content);
};

const collectMilestones = () => {
  const rows = Array.from(milestonesContainer.querySelectorAll(".milestone-item"));
  return rows.map((row) => ({
    title: row.querySelector("input[name='milestone_title']").value.trim(),
    amount: Number(row.querySelector("input[name='milestone_amount']").value),
    due_date: row.querySelector("input[name='milestone_due_date']").value,
    paid: row.querySelector("input[name='milestone_paid']").checked,
  }));
};

const refreshDashboard = async () => {
  const currency = dashboardCurrencySelect.value;
  updateExportLinks();
  const [overview, projects] = await Promise.all([fetchOverview(currency), fetchProjects(currency)]);
  renderOverview(overview);
  renderProjects(projects);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formFeedback.className = "";
  formFeedback.textContent = "Saving project...";

  const formData = new FormData(form);
  const milestones = collectMilestones();
  const payload = {
    client_name: formData.get("client_name"),
    project_name: formData.get("project_name"),
    currency: formData.get("currency"),
    total_price: Number(formData.get("total_price")),
    paid_amount: Number(formData.get("paid_amount")),
    start_date: formData.get("start_date"),
    deadline: formData.get("deadline"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    milestones: milestones.filter((milestone) => milestone.title && milestone.due_date && !Number.isNaN(milestone.amount)),
  };

  try {
    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Unable to save project.");
    }
    form.reset();
    projectCurrencySelect.value = dashboardCurrencySelect.value;
    milestonesContainer.innerHTML = "";
    createMilestoneItem();
    formFeedback.textContent = "Project saved successfully.";
    formFeedback.classList.add("success");
    await refreshDashboard();
  } catch (error) {
    formFeedback.textContent = error.message;
    formFeedback.classList.add("error");
  }
});

shareForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(shareForm);
  const payload = {
    client_email: formData.get("client_email"),
    admin_email: formData.get("admin_email"),
    currency: dashboardCurrencySelect.value,
  };

  shareResult.textContent = "Generating report draft...";
  try {
    const response = await fetch("/api/admin/share-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Unable to generate email draft.");
    }
    shareResult.innerHTML = `
      <p>Draft ready for: <strong>${body.recipients}</strong> (${body.currency})</p>
      <a href="${body.mailto_link}">Open email draft</a>
    `;
  } catch (error) {
    shareResult.textContent = error.message;
  }
});

dashboardCurrencySelect.addEventListener("change", async () => {
  projectCurrencySelect.value = dashboardCurrencySelect.value;
  try {
    await refreshDashboard();
  } catch (error) {
    formFeedback.textContent = error.message;
    formFeedback.classList.add("error");
  }
});

addMilestoneButton.addEventListener("click", createMilestoneItem);

projectCurrencySelect.value = dashboardCurrencySelect.value;
createMilestoneItem();
refreshDashboard().catch((error) => {
  formFeedback.textContent = error.message;
  formFeedback.classList.add("error");
});
