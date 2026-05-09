from __future__ import annotations

import csv
import io
import json
import sqlite3
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote

from flask import Flask, Response, abort, jsonify, render_template, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "admin_dashboard.db"


ALLOWED_STATUSES = {"planned", "in_progress", "on_hold", "completed", "cancelled"}


@dataclass
class ProjectSummary:
    total_projects: int = 0
    active_projects: int = 0
    completed_projects: int = 0
    pending_payments_count: int = 0
    pending_payments_amount: float = 0.0
    overdue_payments_count: int = 0
    overdue_payments_amount: float = 0.0
    upcoming_deadlines_count: int = 0
    total_contract_value: float = 0.0
    total_paid: float = 0.0
    total_remaining: float = 0.0


def _today() -> date:
    return date.today()


def _parse_date(raw_value: str) -> date:
    return datetime.strptime(raw_value, "%Y-%m-%d").date()


def _coerce_amount(raw_value: Any) -> float:
    amount = float(raw_value)
    return round(amount, 2)


def _calculate_project_metrics(project: dict[str, Any], milestones: list[dict[str, Any]]) -> dict[str, Any]:
    total_price = float(project["total_price"])
    paid_amount = float(project["paid_amount"])
    remaining_balance = max(total_price - paid_amount, 0.0)
    payment_progress = 0.0 if total_price <= 0 else min((paid_amount / total_price) * 100, 100.0)

    deadline = _parse_date(project["deadline"])
    today = _today()
    days_remaining = (deadline - today).days
    deadline_state = "overdue" if days_remaining < 0 else "upcoming" if days_remaining <= 14 else "on_track"

    overdue_milestones = [
        milestone for milestone in milestones if not milestone["paid"] and _parse_date(milestone["due_date"]) < today
    ]
    pending_milestones = [
        milestone for milestone in milestones if not milestone["paid"] and _parse_date(milestone["due_date"]) >= today
    ]

    next_due_milestone = None
    unpaid_sorted = sorted(
        [milestone for milestone in milestones if not milestone["paid"]],
        key=lambda milestone: milestone["due_date"],
    )
    if unpaid_sorted:
        next_due_milestone = unpaid_sorted[0]

    effective_status = project["status"]
    if remaining_balance <= 0 and project["status"] != "cancelled":
        effective_status = "completed"

    return {
        "remaining_balance": round(remaining_balance, 2),
        "payment_progress": round(payment_progress, 2),
        "days_remaining": days_remaining,
        "deadline_state": deadline_state,
        "pending_milestones_count": len(pending_milestones),
        "overdue_milestones_count": len(overdue_milestones),
        "next_due_milestone": next_due_milestone,
        "effective_status": effective_status,
    }


class DashboardRepository:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_name TEXT NOT NULL,
                    project_name TEXT NOT NULL,
                    total_price REAL NOT NULL CHECK (total_price >= 0),
                    paid_amount REAL NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
                    start_date TEXT NOT NULL,
                    deadline TEXT NOT NULL,
                    status TEXT NOT NULL,
                    notes TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS payment_milestones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    due_date TEXT NOT NULL,
                    amount REAL NOT NULL CHECK (amount >= 0),
                    paid INTEGER NOT NULL DEFAULT 0,
                    paid_date TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
                """
            )

    def create_project(self, payload: dict[str, Any]) -> dict[str, Any]:
        status = payload["status"]
        if status not in ALLOWED_STATUSES:
            raise ValueError(f"Invalid status: {status}")

        total_price = _coerce_amount(payload["total_price"])
        paid_amount = _coerce_amount(payload.get("paid_amount", 0))
        if paid_amount > total_price:
            raise ValueError("Paid amount cannot exceed total project price.")

        start_date = _parse_date(payload["start_date"])
        deadline = _parse_date(payload["deadline"])
        if deadline < start_date:
            raise ValueError("Deadline cannot be before start date.")

        milestones = payload.get("milestones", [])
        milestone_total = 0.0
        for milestone in milestones:
            milestone_total += _coerce_amount(milestone["amount"])
        if milestone_total > total_price:
            raise ValueError("Total milestone amount cannot exceed total project price.")

        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO projects (
                    client_name, project_name, total_price, paid_amount, start_date, deadline, status, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload["client_name"].strip(),
                    payload["project_name"].strip(),
                    total_price,
                    paid_amount,
                    payload["start_date"],
                    payload["deadline"],
                    status,
                    payload.get("notes", "").strip() or None,
                ),
            )
            project_id = cursor.lastrowid

            for milestone in milestones:
                amount = _coerce_amount(milestone["amount"])
                due_date = _parse_date(milestone["due_date"])
                if due_date < start_date:
                    raise ValueError("Milestone due date cannot be before project start date.")
                conn.execute(
                    """
                    INSERT INTO payment_milestones (project_id, title, due_date, amount, paid, paid_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        project_id,
                        milestone["title"].strip(),
                        milestone["due_date"],
                        amount,
                        1 if milestone.get("paid", False) else 0,
                        milestone.get("paid_date"),
                    ),
                )

        return self.get_project(project_id)

    def update_project(self, project_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        updates: list[str] = []
        values: list[Any] = []

        if "paid_amount" in payload:
            paid_amount = _coerce_amount(payload["paid_amount"])
            updates.append("paid_amount = ?")
            values.append(paid_amount)
        if "status" in payload:
            status = payload["status"]
            if status not in ALLOWED_STATUSES:
                raise ValueError(f"Invalid status: {status}")
            updates.append("status = ?")
            values.append(status)
        if "deadline" in payload:
            _parse_date(payload["deadline"])
            updates.append("deadline = ?")
            values.append(payload["deadline"])

        if not updates:
            return self.get_project(project_id)

        updates.append("updated_at = CURRENT_TIMESTAMP")
        values.append(project_id)

        with self._connect() as conn:
            conn.execute(
                f"UPDATE projects SET {', '.join(updates)} WHERE id = ?",
                values,
            )
        return self.get_project(project_id)

    def get_milestones(self, project_id: int) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT id, project_id, title, due_date, amount, paid, paid_date
                FROM payment_milestones
                WHERE project_id = ?
                ORDER BY due_date ASC
                """,
                (project_id,),
            ).fetchall()
        return [
            {
                "id": row["id"],
                "project_id": row["project_id"],
                "title": row["title"],
                "due_date": row["due_date"],
                "amount": round(float(row["amount"]), 2),
                "paid": bool(row["paid"]),
                "paid_date": row["paid_date"],
            }
            for row in rows
        ]

    def get_project(self, project_id: int) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT id, client_name, project_name, total_price, paid_amount, start_date, deadline, status, notes
                FROM projects
                WHERE id = ?
                """,
                (project_id,),
            ).fetchone()
        if row is None:
            raise KeyError(f"Project {project_id} not found")

        project = {
            "id": row["id"],
            "client_name": row["client_name"],
            "project_name": row["project_name"],
            "total_price": round(float(row["total_price"]), 2),
            "paid_amount": round(float(row["paid_amount"]), 2),
            "start_date": row["start_date"],
            "deadline": row["deadline"],
            "status": row["status"],
            "notes": row["notes"],
        }
        milestones = self.get_milestones(project_id)
        metrics = _calculate_project_metrics(project, milestones)
        project["milestones"] = milestones
        project["metrics"] = metrics
        return project

    def list_projects(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT id
                FROM projects
                ORDER BY deadline ASC, id DESC
                """
            ).fetchall()

        return [self.get_project(row["id"]) for row in rows]


def _build_overview(projects: list[dict[str, Any]]) -> dict[str, Any]:
    summary = ProjectSummary()
    today = _today()
    upcoming_deadlines: list[dict[str, Any]] = []

    for project in projects:
        summary.total_projects += 1
        metrics = project["metrics"]
        summary.total_contract_value += project["total_price"]
        summary.total_paid += project["paid_amount"]
        summary.total_remaining += metrics["remaining_balance"]

        if metrics["effective_status"] == "completed":
            summary.completed_projects += 1
        elif metrics["effective_status"] != "cancelled":
            summary.active_projects += 1

        for milestone in project["milestones"]:
            if milestone["paid"]:
                continue
            due_date = _parse_date(milestone["due_date"])
            if due_date < today:
                summary.overdue_payments_count += 1
                summary.overdue_payments_amount += milestone["amount"]
            else:
                summary.pending_payments_count += 1
                summary.pending_payments_amount += milestone["amount"]

        deadline_date = _parse_date(project["deadline"])
        if 0 <= (deadline_date - today).days <= 14 and metrics["effective_status"] != "completed":
            summary.upcoming_deadlines_count += 1
            upcoming_deadlines.append(
                {
                    "project_id": project["id"],
                    "project_name": project["project_name"],
                    "client_name": project["client_name"],
                    "deadline": project["deadline"],
                    "days_remaining": metrics["days_remaining"],
                }
            )

    return {
        "totals": {
            "total_projects": summary.total_projects,
            "active_projects": summary.active_projects,
            "completed_projects": summary.completed_projects,
            "pending_payments_count": summary.pending_payments_count,
            "pending_payments_amount": round(summary.pending_payments_amount, 2),
            "overdue_payments_count": summary.overdue_payments_count,
            "overdue_payments_amount": round(summary.overdue_payments_amount, 2),
            "upcoming_deadlines_count": summary.upcoming_deadlines_count,
            "total_contract_value": round(summary.total_contract_value, 2),
            "total_paid": round(summary.total_paid, 2),
            "total_remaining": round(summary.total_remaining, 2),
            "portfolio_payment_progress": round(
                0
                if summary.total_contract_value <= 0
                else (summary.total_paid / summary.total_contract_value) * 100,
                2,
            ),
        },
        "upcoming_deadlines": upcoming_deadlines,
    }


def _serialize_for_csv(projects: list[dict[str, Any]]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Project ID",
            "Client Name",
            "Project Name",
            "Status",
            "Start Date",
            "Deadline",
            "Total Price",
            "Paid Amount",
            "Remaining Balance",
            "Payment Progress (%)",
            "Days Remaining",
            "Overdue Milestones",
            "Pending Milestones",
        ]
    )
    for project in projects:
        metrics = project["metrics"]
        writer.writerow(
            [
                project["id"],
                project["client_name"],
                project["project_name"],
                metrics["effective_status"],
                project["start_date"],
                project["deadline"],
                f"{project['total_price']:.2f}",
                f"{project['paid_amount']:.2f}",
                f"{metrics['remaining_balance']:.2f}",
                f"{metrics['payment_progress']:.2f}",
                metrics["days_remaining"],
                metrics["overdue_milestones_count"],
                metrics["pending_milestones_count"],
            ]
        )
    return output.getvalue()


repo = DashboardRepository(DB_PATH)
app = Flask(__name__, template_folder=str(BASE_DIR / "templates"), static_folder=str(BASE_DIR / "static"))


@app.route("/")
def site_home() -> Response:
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:asset>")
def site_assets(asset: str) -> Response:
    blocked_prefixes = ("api/", "admin", "static/")
    if asset.startswith(blocked_prefixes):
        abort(404)
    target = BASE_DIR / asset
    if target.exists() and target.is_file():
        return send_from_directory(BASE_DIR, asset)
    abort(404)


@app.route("/admin")
def admin_dashboard() -> str:
    return render_template("admin_dashboard.html")


@app.route("/api/admin/projects", methods=["GET"])
def list_projects() -> Response:
    projects = repo.list_projects()
    return jsonify({"projects": projects})


@app.route("/api/admin/projects", methods=["POST"])
def create_project() -> Response:
    payload = request.get_json(silent=True) or {}
    required_fields = [
        "client_name",
        "project_name",
        "total_price",
        "paid_amount",
        "start_date",
        "deadline",
        "status",
    ]
    missing = [field for field in required_fields if field not in payload or payload[field] in (None, "")]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        project = repo.create_project(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover - safe response boundary
        return jsonify({"error": f"Unable to create project: {exc}"}), 500

    return jsonify({"project": project}), 201


@app.route("/api/admin/projects/<int:project_id>", methods=["GET"])
def get_project(project_id: int) -> Response:
    try:
        project = repo.get_project(project_id)
    except KeyError:
        return jsonify({"error": "Project not found"}), 404
    return jsonify({"project": project})


@app.route("/api/admin/projects/<int:project_id>", methods=["PATCH"])
def patch_project(project_id: int) -> Response:
    payload = request.get_json(silent=True) or {}
    try:
        project = repo.update_project(project_id, payload)
    except KeyError:
        return jsonify({"error": "Project not found"}), 404
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify({"project": project})


@app.route("/api/admin/overview", methods=["GET"])
def get_overview() -> Response:
    projects = repo.list_projects()
    overview = _build_overview(projects)
    return jsonify(overview)


@app.route("/api/admin/export.csv", methods=["GET"])
def export_csv() -> Response:
    projects = repo.list_projects()
    csv_payload = _serialize_for_csv(projects)
    return Response(
        csv_payload,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=admin-project-financial-report.csv"},
    )


@app.route("/api/admin/export.json", methods=["GET"])
def export_json() -> Response:
    projects = repo.list_projects()
    overview = _build_overview(projects)
    payload = {"generated_at": datetime.utcnow().isoformat() + "Z", "overview": overview, "projects": projects}
    return Response(
        json.dumps(payload, indent=2),
        mimetype="application/json",
        headers={"Content-Disposition": "attachment; filename=admin-project-financial-report.json"},
    )


@app.route("/api/admin/share-report", methods=["POST"])
def share_report() -> Response:
    payload = request.get_json(silent=True) or {}
    client_email = payload.get("client_email", "").strip()
    admin_email = payload.get("admin_email", "").strip()
    if not client_email and not admin_email:
        return jsonify({"error": "Provide at least one recipient email."}), 400

    projects = repo.list_projects()
    overview = _build_overview(projects)
    totals = overview["totals"]
    subject = "Digi-Tech Project & Financial Status Report"
    body = (
        "Hello,\n\n"
        "Here is the latest operational and financial summary:\n"
        f"- Total projects: {totals['total_projects']}\n"
        f"- Active projects: {totals['active_projects']}\n"
        f"- Completed projects: {totals['completed_projects']}\n"
        f"- Pending payments: {totals['pending_payments_count']} items "
        f"(${totals['pending_payments_amount']:.2f})\n"
        f"- Overdue payments: {totals['overdue_payments_count']} items "
        f"(${totals['overdue_payments_amount']:.2f})\n"
        f"- Upcoming deadlines (14d): {totals['upcoming_deadlines_count']}\n"
        f"- Portfolio payment progress: {totals['portfolio_payment_progress']:.2f}%\n\n"
        "Please review the exported CSV/JSON report from the admin dashboard for full details.\n\n"
        "Regards,\nDigi-Tech Admin Dashboard"
    )

    recipients = ",".join([email for email in [client_email, admin_email] if email])
    subject_value = quote(request.args.get("subject", subject))
    body_value = quote(body)
    mailto_link = f"mailto:{recipients}?subject={subject_value}&body={body_value}"
    return jsonify({"mailto_link": mailto_link, "subject": subject, "body": body, "recipients": recipients})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
