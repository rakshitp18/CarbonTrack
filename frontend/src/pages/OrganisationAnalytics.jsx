import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { organisationService } from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function OrganisationAnalytics() {
  const [data, setData] = useState(null);

  const { theme } = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await organisationService.getDashboard();
        setData(response);
      } catch (err) {
        console.error(err);
      }
    };

    loadDashboard();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];

    return data.categoryBreakdown.map((item) => ({
      name: item.category.replace("_", " "),
      kg: Number(item.totalCo2e),
    }));
  }, [data]);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <Title
        eyebrow="Performance Intelligence"
        title="Find the Biggest Opportunities"
        text="Company-wide category analysis, month-over-month performance and audit-ready sustainability insights."
      />

      <div className="grid gap-6 lg:grid-cols-3">

        <Card
          className="lg:col-span-2"
          title="30-Day Emissions Profile"
        >

          <div className="h-80">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={rows}>

                <CartesianGrid
                  vertical={false}
                  stroke={dark ? "#1e293b" : "#e2e8f0"}
                />

                <XAxis
                  dataKey="name"
                  fontSize={11}
                  stroke={dark ? "#94a3b8" : "#475569"}
                />

                <YAxis
                  fontSize={11}
                  stroke={dark ? "#94a3b8" : "#475569"}
                />

                <Tooltip
                  contentStyle={{
                    background: dark ? "#0f172a" : "#ffffff",
                    border: dark
                      ? "1px solid #334155"
                      : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: dark ? "#ffffff" : "#000000",
                  }}
                />

                <Bar
                  dataKey="kg"
                  fill="#34d399"
                  radius={[8, 8, 0, 0]}
                />

                              </BarChart>

                            </ResponsiveContainer>

                          </div>

                        </Card>

                        <Card title="Month-over-Month Performance">

                          <div className="space-y-4">

                            <p className="text-4xl font-extrabold text-emerald-500">
                              {data.currentMonthEmissions} kg
                            </p>

                            <p
                              className={`text-sm leading-6 ${
                                dark
                                  ? "text-slate-400"
                                  : "text-slate-600"
                              }`}
                            >
                              This month compared with
                              <span className="mx-1 font-semibold">
                                {data.previousMonthEmissions} kg
                              </span>
                              in the previous month.
                            </p>

                            <div
                              className={`h-3 overflow-hidden rounded-full ${
                                dark
                                  ? "bg-slate-800"
                                  : "bg-slate-200"
                              }`}
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
                                style={{
                                  width:
                                    Number(data.previousMonthEmissions) > 0
                                      ? `${Math.min(
                                          (Number(data.currentMonthEmissions) /
                                            Number(data.previousMonthEmissions)) *
                                            100,
                                          100
                                        )}%`
                                      : "100%",
                                }}
                              />
                            </div>

                          </div>

                        </Card>

                      </div>

                      {/* Information Cards */}

                      <div className="grid gap-6 md:grid-cols-2">

                        <Card title="Department Comparison">

                          <p
                            className={`text-sm leading-7 ${
                              dark
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            Department-level reporting becomes available once
                            employees are assigned to departments. This ensures
                            accurate comparisons without mixing unverified data.
                          </p>

                        </Card>

                        <Card title="Designation Comparison">

                          <p
                            className={`text-sm leading-7 ${
                              dark
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            Compare sustainability patterns across different job
                            roles while maintaining employee privacy. Assign
                            designations during onboarding to unlock this view.
                          </p>

                        </Card>

                      </div>

                    </div>
                  );
                }export function Title({ eyebrow, title, text }) {
                   const { theme } = useTheme();
                   const dark = theme === "dark";

                   return (
                     <section>
                       <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500">
                         {eyebrow}
                       </p>

                       <h1 className="mt-2 text-3xl font-bold">
                         {title}
                       </h1>

                       <p
                         className={`mt-2 max-w-2xl text-sm leading-7 ${
                           dark
                             ? "text-slate-400"
                             : "text-slate-600"
                         }`}
                       >
                         {text}
                       </p>
                     </section>
                   );
                 }

                 export function Card({
                   title,
                   children,
                   className = "",
                 }) {
                   const { theme } = useTheme();
                   const dark = theme === "dark";

                   return (
                     <article
                       className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                           dark
                             ? "border-[#243654] bg-[#101827] shadow-[0_12px_30px_rgba(0,0,0,.45)]"
                             : "border-[#d6e8ff] bg-gradient-to-br from-white to-[#fbfdff] shadow-[0_8px_24px_rgba(15,23,42,.08)]"
                       } ${className}`}
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
                           ? "border border-amber-400/10"
                           : "border border-amber-300/40"
                       }`}
                     />
                       <h2 className="mb-5 text-lg font-bold">
                         {title}
                       </h2>

                       {children}
                     </article>
                   );
                 }

                 export function Loading() {
                   const { theme } = useTheme();
                   const dark = theme === "dark";

                   return (
                     <div className="flex justify-center py-24">

                       <div className="text-center">

                         <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />

                         <p
                           className={`text-sm ${
                             dark
                               ? "text-slate-400"
                               : "text-slate-600"
                           }`}
                         >
                           Loading organisation data...
                         </p>

                       </div>

                     </div>
                   );
                 }

