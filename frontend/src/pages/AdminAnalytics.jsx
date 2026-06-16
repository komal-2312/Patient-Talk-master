import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const BACKENDURL = import.meta.env.VITE_BACKENDURL;

const STATUS_COLORS = {
  "Pending":      "#BA7517",
  "Under Review": "#185FA5",
  "Assigned":     "#534AB7",
  "In Progress":  "#0F6E56",
  "Resolved":     "#3B6D11",
  "Closed":       "#5F5E5A",
  "Rejected":     "#A32D2D",
};

const PRIORITY_COLORS = {
  "Low":      "#3B6D11",
  "Medium":   "#BA7517",
  "High":     "#A32D2D",
  "Critical": "#791F1F",
};

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: 16,
      padding: "20px 24px",
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function BarRow({ label, count, max, color }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <span style={{
        fontSize: 13,
        color: "var(--text-muted)",
        width: 110,
        flexShrink: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }} title={label}>{label}</span>
      <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.6s ease",
        }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 24, textAlign: "right" }}>{count}</span>
    </div>
  );
}

function SectionCard({ title, children, fullWidth }) {
  return (
    <div style={{
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      borderRadius: 20,
      padding: "24px 28px",
      backdropFilter: "blur(12px)",
      gridColumn: fullWidth ? "1 / -1" : undefined,
    }}>
      <p style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{title}</p>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartReady, setChartReady] = useState(!!window.Chart);

  const statusChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const statusInstance = useRef(null);
  const trendInstance = useRef(null);

  // Load Chart.js dynamically
  useEffect(() => {
    if (window.Chart) {
      setChartReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => setChartReady(true);
    document.head.appendChild(s);
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKENDURL}/api/admin/analytics`, {
          credentials: "include",
        });
        if (res.status === 412 || res.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        const json = await res.json();
        if (!json.success) {
          setError(json.message || "Failed to load analytics");
          return;
        }
        setData(json.data);
      } catch {
        setError("Could not reach the server");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  // Build status doughnut chart
  useEffect(() => {
    if (!data || !chartReady || !window.Chart || !statusChartRef.current) return;
    if (statusInstance.current) statusInstance.current.destroy();

    const labels = Object.keys(data.byStatus);
    const values = Object.values(data.byStatus);
    const colors = labels.map(l => STATUS_COLORS[l] || "#888780");

    statusInstance.current = new window.Chart(statusChartRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }, [data, chartReady]);

  // Build trend line chart
  useEffect(() => {
    if (!data || !chartReady || !window.Chart || !trendChartRef.current) return;
    if (trendInstance.current) trendInstance.current.destroy();

    trendInstance.current = new window.Chart(trendChartRef.current, {
      type: "line",
      data: {
        labels: data.last7.map(d => d.label),
        datasets: [{
          label: "Submissions",
          data: data.last7.map(d => d.count),
          borderColor: "#185FA5",
          backgroundColor: "rgba(24,95,165,0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#185FA5",
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, callback: v => Math.round(v) },
          },
          x: {
            ticks: { autoSkip: false, maxRotation: 0 },
          },
        },
      },
    });
  }, [data, chartReady]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      statusInstance.current?.destroy();
      trendInstance.current?.destroy();
    };
  }, []);

  // ── Loading ──
  if (loading) return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Dashboard
          </button>
        </div>
        <div className="admin-nav-center">
          <div className="admin-brand">
            <span className="admin-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="admin-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="admin-nav-right" />
      </nav>
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p className="admin-loading-text">Loading analytics…</p>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Dashboard
          </button>
        </div>
        <div className="admin-nav-center">
          <div className="admin-brand">
            <span className="admin-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="admin-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="admin-nav-right" />
      </nav>
      <div className="admin-loading">
        <p style={{ color: "var(--danger-color, #e55353)", fontWeight: 600 }}>{error}</p>
      </div>
    </div>
  );

  const statusEntries = Object.entries(data.byStatus);
  const priorityEntries = Object.entries(data.byPriority).sort((a, b) => b[1] - a[1]);
  const deptEntries = Object.entries(data.byDepartment).sort((a, b) => b[1] - a[1]);
  const maxPriority = priorityEntries[0]?.[1] || 1;
  const maxDept = deptEntries[0]?.[1] || 1;

  return (
    <div className="admin-page">
      {/* Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Dashboard
          </button>
        </div>
        <div className="admin-nav-center">
          <div className="admin-brand">
            <span className="admin-brand-icon-svg">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polygon points="12,5 14.5,9.5 20,10.5 16,14.5 17.5,20 12,17.5 6.5,20 8,14.5 4,10.5 9.5,9.5" fill="#e00000" />
                <path d="M12 2 A10 10 0 0 1 21.5 8 L18.5 8 L22.5 13 L23.5 7 L20.5 7 A11.5 11.5 0 0 0 12 0.5 Z" fill="#f09b50" />
                <path d="M12 22 A10 10 0 0 1 2.5 16 L5.5 16 L1.5 11 L0.5 17 L3.5 17 A11.5 11.5 0 0 0 12 23.5 Z" fill="#f09b50" />
              </svg>
            </span>
            <span className="admin-brand-name">PatientTalkback</span>
          </div>
        </div>
        <div className="admin-nav-right" />
      </nav>

      <div className="admin-content admin-content--wide">

        {/* Page Header */}
        <div className="admin-page-header">
          <div className="admin-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Analytics
          </div>
          <h1 className="admin-page-title">Complaint Analytics</h1>
          <p className="admin-page-subtitle">Overview of all feedback and complaints for your hospital</p>
        </div>

        {/* Metric Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}>
          <MetricCard label="Total complaints" value={data.total} />
          <MetricCard label="Resolved" value={data.resolved} />
          <MetricCard label="Resolution rate" value={`${data.resolutionRate}%`} />
          <MetricCard
            label="Avg resolution time"
            value={data.avgResolutionHours !== null ? `${data.avgResolutionHours}h` : "N/A"}
            sub={data.avgResolutionHours !== null ? "average" : "none resolved yet"}
          />
        </div>

        {/* Charts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}>

          {/* Status Doughnut */}
          <SectionCard title="Complaints by status">
            {statusEntries.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "2rem 0", margin: 0 }}>
                No complaints yet
              </p>
            ) : (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  {statusEntries.map(([label, count]) => (
                    <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: STATUS_COLORS[label] || "#888780",
                        flexShrink: 0,
                      }} />
                      {label} {count}
                    </span>
                  ))}
                </div>
                <div style={{ position: "relative", height: 200 }}>
                  <canvas
                    ref={statusChartRef}
                    role="img"
                    aria-label="Doughnut chart of complaints by status"
                  />
                </div>
              </>
            )}
          </SectionCard>

          {/* Priority Bars */}
          <SectionCard title="Priority breakdown">
            {priorityEntries.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "2rem 0", margin: 0 }}>
                No data yet
              </p>
            ) : (
              priorityEntries.map(([label, count]) => (
                <BarRow
                  key={label}
                  label={label}
                  count={count}
                  max={maxPriority}
                  color={PRIORITY_COLORS[label] || "#888780"}
                />
              ))
            )}
          </SectionCard>

        </div>

        {/* Trend Chart — full width */}
        <div style={{ marginBottom: 20 }}>
          <SectionCard title="Submissions — last 7 days">
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#185FA5" }} />
                Submissions per day
              </span>
            </div>
            <div style={{ position: "relative", height: 180 }}>
              <canvas
                ref={trendChartRef}
                role="img"
                aria-label="Line chart of daily complaint submissions over the last 7 days"
              />
            </div>
          </SectionCard>
        </div>

        {/* Department Bars — full width */}
        <SectionCard title="Complaints by department">
          {deptEntries.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", padding: "2rem 0", margin: 0 }}>
              No data yet
            </p>
          ) : (
            deptEntries.map(([label, count]) => (
              <BarRow
                key={label}
                label={label}
                count={count}
                max={maxDept}
                color="var(--primary-color)"
              />
            ))
          )}
        </SectionCard>

      </div>

      <footer className="admin-footer">
        <p className="admin-footer-text">Powered by PatientTalkback</p>
      </footer>
    </div>
  );
}