import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { organisationService } from "../services/api";
import {
  FiActivity,
  FiArrowRight,
  FiTrendingDown,
  FiUsers,
} from "react-icons/fi";

import { Card, Loading, Title } from "./OrganisationAnalytics";

export default function OrganisationPortal() {
  const [data, setData] = useState(null);

  const { theme } = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await organisationService.getDashboard();
        setData(response);
      } catch (err) {
        console.error("Failed to load organisation dashboard", err);
      }
    };

    loadDashboard();
  }, []);

  if (!data) {
    return <Loading />;
  }

  const current = Number(data.currentMonthEmissions);
  const previous = Number(data.previousMonthEmissions);

  const percent =
    previous > 0
      ? (((current - previous) / previous) * 100).toFixed(1)
      : "—";

  return (
    <div className="w-full space-y-6 flex-1 flex flex-col">

      <Title
        eyebrow="Organisation Overview"
        title={`Welcome to ${data.organisationName}`}
        text="Your central workspace for sustainability, employee engagement and carbon intelligence."
      />
      {/* Hero Banner */}
      <section
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
          dark
            ? "border-[#2A4365] bg-gradient-to-br from-[#101827] via-[#162235] to-[#0F172A] shadow-[0_16px_40px_rgba(0,0,0,.45)]"
            : "border-[#7AA8FF] bg-white shadow-[0_10px_35px_rgba(15,23,42,.08)]"
        }`}
      >
      {/* Premium Background */}

      <div
        className={`absolute inset-0 overflow-hidden rounded-3xl ${
          dark ? "" : ""
        }`}
      >

        {/* Blue Glow */}
        <div
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
        />

        {/* Gold Glow */}
        <div
          className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl"
        />

        {/* Bottom Blue */}
        <div
          className="absolute bottom-0 left-1/3 h-56 w-80 rounded-full bg-sky-300/10 blur-3xl"
        />
        <div
          className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400"
        />

      </div>
        <div className="relative z-10 grid gap-6 p-6 lg:grid-cols-[1.6fr_0.9fr]">

          <div>

            <p className="text-xs font-bold uppercase tracking-[.25em] text-emerald-500">
              Corporate Sustainability Workspace
            </p>

            <h2 className="mt-2 text-4xl font-extrabold tracking-tight leading-tight">
              <span
                className={`bg-gradient-to-r ${
                  dark
                    ? "from-[#60a5fa] via-[#38bdf8] to-[#34d399]"
                    : "from-[#2563eb] via-[#3b82f6] to-[#14b8a6]"
                } bg-clip-text text-transparent`}
              >
                {data.organisationName}
              </span>{" "}
              Operations Console
            </h2>

            <p
              className={`mt-4 max-w-2xl leading-7 ${
                dark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Track your organisation's carbon footprint, monitor employee
              participation, analyse trends and generate sustainability reports
              from one central dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Action
                to="/organisation/activity"
                label="Log Activity"
              />

              <Action
                to="/organisation/people"
                label="People & Teams"
              />

            </div>

          </div>

          <div
            className={`rounded-2xl border p-6 transition-all ${
              dark
              ? "border-[#2D4668] bg-[#0B1624]"
              : "border-[#7AA8FF] bg-white/90 backdrop-blur-md"
            }`}
          >

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Company Join Code
            </p>

            <div
              className={`mt-4 rounded-xl px-4 py-4 text-center font-mono text-3xl font-bold tracking-[.25em] ${
                dark
                  ? "bg-slate-900 text-emerald-400"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {data.joinCode}
            </div>

            <p
              className={`mt-4 text-sm ${
                dark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Share this code with employees so they can securely join your
              organisation.
            </p>

          </div>

        </div>
      </section>

      {/* KPI Cards */}

      <section className="grid gap-5 md:grid-cols-3">

        <Stat
          dark={dark}
          icon={<FiActivity size={22} />}
          label="Current Month"
          value={`${current.toFixed(1)} kg`}
          text="CO₂e Reported"
        />

        <Stat
          dark={dark}
          icon={<FiUsers size={22} />}
          label="Active Members"
          value={data.employees.length}
          text="Employees Participating"
        />

        <Stat
          dark={dark}
          icon={<FiTrendingDown size={22} />}
          label="vs Last Month"
          value={
            percent === "—"
              ? "—"
              : `${percent}%`
          }
          text={`${previous.toFixed(1)} kg CO₂e`}
        />

      </section>
          {/* Workspace Cards */}

          <section className="grid gap-6 lg:grid-cols-2">

            <Card title="Run your Sustainability Programme">

              <p
                className={`text-sm leading-7 ${
                  dark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Employees can securely join your organisation using the
                company join code along with their employee ID,
                department and designation. Every activity they log is
                automatically aggregated into your organisation analytics,
                making sustainability tracking effortless.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Action
                  to="/organisation/activity"
                  label="Log an Activity"
                />

                <Action
                  to="/organisation/people"
                  label="People & Teams"
                />

              </div>

            </Card>

            <Card title="Reporting at a Glance">

              <dl className="space-y-4">

                <Row
                  dark={dark}
                  label="Current Month Emissions"
                  value={`${data.currentMonthEmissions} kg CO₂e`}
                />

                <Row
                  dark={dark}
                  label="Previous Month Emissions"
                  value={`${data.previousMonthEmissions} kg CO₂e`}
                />

                <Row
                  dark={dark}
                  label="Tracked Categories"
                  value={
                    data.categoryBreakdown.filter(
                      (item) => Number(item.totalCo2e) > 0
                    ).length
                  }
                />

                <Row
                  dark={dark}
                  label="Registered Employees"
                  value={data.employees.length}
                />

              </dl>

              <div className="mt-6">

                <Link
                  to="/organisation/reports"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-emerald-600"
                >
                  Open CSR Reports
                  <FiArrowRight />
                </Link>

              </div>

            </Card>

          </section>

          {/* Quick Insights */}

          <section className="grid gap-6 lg:grid-cols-3">

            <div
              className={`rounded-2xl border p-6 transition-all ${
                dark
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-white shadow-lg"
              }`}
            >
              <h3 className="text-lg font-bold">
                🌱 Sustainability Score
              </h3>

              <p
                className={`mt-3 text-sm ${
                  dark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Your organisation is actively tracking carbon emissions
                and encouraging employee participation.

                Continue improving month by month to reduce your overall
                environmental impact.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-6 transition-all ${
                dark
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-white shadow-lg"
              }`}
            >
              <h3 className="text-lg font-bold">
                👥 Employee Engagement
              </h3>

              <p
                className={`mt-3 text-sm ${
                  dark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {data.employees.length} employees are currently part of
                your sustainability programme.

                Encourage daily activity logging to increase engagement
                and improve reporting accuracy.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-6 transition-all ${
                dark
                  ? "border-slate-800 bg-slate-900/70"
                  : "border-slate-200 bg-white shadow-lg"
              }`}
            >
              <h3 className="text-lg font-bold">
                📈 Monthly Trend
              </h3>

              <p
                className={`mt-3 text-sm ${
                  dark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {percent === "—"
                  ? "Not enough historical data is available for comparison."
                  : `Your organisation's emissions changed by ${percent}% compared with the previous month.`}
              </p>
            </div>

          </section>
          </div>
        );
      }

      function Stat({ dark, icon, label, value, text }) {
        return (
          <article
            className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
              dark
                ? "border-[#243654] bg-[#111827] hover:border-[#4f8cff]"
                : "border-[#d6e8ff] bg-gradient-to-br from-white to-[#fbfdff] hover:border-[#4f8cff] shadow-[0_8px_24px_rgba(15,23,42,.08)]"
            }`}
          >
          <div
            className={`absolute left-0 top-0 h-[2px] w-full ${
              dark
                ? "bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400"
                : "bg-gradient-to-r from-[#3b82f6] via-[#14b8a6] to-[#f59e0b]"
            }`}
          />

          <div
            className={`pointer-events-none absolute inset-0 rounded-2xl ${
              dark
                ? "border border-blue-500/20"
                : "border border-[#4f8cff]/40"
            }`}
          />

          <div
            className={`pointer-events-none absolute inset-[2px] rounded-2xl ${
              dark
                ? "border border-amber-300/30"
                : "border border-amber-300/40"
            }`}
          />
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                {icon}
              </span>

              <span
                className={`text-xs font-semibold ${
                  dark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                LIVE
              </span>
            </div>

            <p
              className={`mt-5 text-xs font-bold uppercase tracking-[0.2em] ${
                dark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              {label}
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {value}
            </h3>

            <p
              className={`mt-2 text-sm ${
                dark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {text}
            </p>
          </article>
        );
      }

      function Action({ to, label }) {
        return (
          <Link
            to={to}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white no-underline transition-all duration-300 hover:scale-105 hover:bg-emerald-600"
          >
            {label}
            <FiArrowRight size={16} />
          </Link>
        );
      }

      function Row({ dark, label, value }) {
        return (
          <div
            className={`flex items-center justify-between border-b py-3 ${
              dark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <dt
              className={`text-sm ${
                dark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              {label}
            </dt>

            <dd className="font-semibold">
              {value}
            </dd>
          </div>
        );
      }