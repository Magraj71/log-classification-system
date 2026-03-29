"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FiActivity, FiFileText, FiTrendingUp, FiClock, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiBarChart2, FiUpload, FiArrowRight,
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiRadio,
  FiPause, FiPlay
} from "react-icons/fi";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import ExportButtons from "@/app/components/ExportButtons";

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];
const SEVERITY_COLORS = { "Critical": "#dc2626", "High": "#ea580c", "Medium": "#ca8a04", "Low": "#16a34a" };

export default function Dashboard() {
  const { user, token, loading, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState({ trendData: [], categoryData: [], severityData: [], topPatterns: [] });
  const router = useRouter();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Live Feed
  const [liveMode, setLiveMode] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);
  const [livePaused, setLivePaused] = useState(false);
  const liveRef = useRef(null);
  const intervalRef = useRef(null);

  const [stats, setStats] = useState({
    totalLogs: 0, processed: 0, errors: 0, warnings: 0, info: 0, accuracy: 0, severityDistribution: {}
  });

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  useEffect(() => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/logs", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error(err));

    fetch("/api/logs/stats", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.trendData) setChartData(data);
      })
      .catch((err) => console.error(err));
  }, [token]);

  // Live Feed Polling
  useEffect(() => {
    if (liveMode && !livePaused) {
      const fetchLive = () => {
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        fetch("/api/logs", { headers })
          .then(r => r.json())
          .then(data => {
            if (data.logs) {
              setLiveLogs(data.logs.slice(0, 20));
            }
          })
          .catch(() => {});
      };
      fetchLive();
      intervalRef.current = setInterval(fetchLive, 5000);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [liveMode, livePaused, token]);

  // Filter and sort logs
  const filteredLogs = logs
    .filter((log) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (log.errorSummary || "").toLowerCase().includes(term) ||
        (log.logText || "").toLowerCase().includes(term) ||
        (log.rootCause || "").toLowerCase().includes(term);
      
      const matchesCategory = filterCategory === "ALL" || log.category === filterCategory;
      
      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && new Date(log.createdAt) >= new Date(dateFrom);
      if (dateTo) matchesDate = matchesDate && new Date(log.createdAt) <= new Date(dateTo + "T23:59:59");
      
      return matchesSearch && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
        case "confidence-high": return (b.confidence || 0) - (a.confidence || 0);
        case "confidence-low": return (a.confidence || 0) - (b.confidence || 0);
        case "severity": return (b.severity?.score || 0) - (a.severity?.score || 0);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / perPage));
  const paginatedLogs = filteredLogs.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, filterCategory, sortBy, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview 👋</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Monitor and analyze your application's health</p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold transition ${
                liveMode 
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" 
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              }`}
            >
              <FiRadio className={`w-5 h-5 ${liveMode ? "animate-pulse text-red-500" : ""}`} />
              <span>{liveMode ? "Live" : "Live Feed"}</span>
            </button>
            <Link href="/upload" className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition transform hover:-translate-y-0.5">
              <FiActivity className="text-white w-5 h-5" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Analyzed</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-emerald-100/50">
                <FiFileText className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Errors</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.errors.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center ring-1 ring-red-100/50">
                <FiXCircle className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Warnings</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.warnings.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center ring-1 ring-yellow-100/50">
                <FiAlertCircle className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Info</p>
                <p className="text-3xl font-extrabold text-slate-900">{(stats.info || 0).toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center ring-1 ring-blue-100/50">
                <FiCheckCircle className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Confidence</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.accuracy || 0}%</p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-emerald-100/50">
                <FiBarChart2 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Feed Panel */}
        {liveMode && (
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 mb-8 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-bold text-slate-200 uppercase">Live Log Feed</h3>
              </div>
              <button onClick={() => setLivePaused(!livePaused)} className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-800">
                {livePaused ? <FiPlay /> : <FiPause />}
              </button>
            </div>
            <div ref={liveRef} className="p-4 max-h-[300px] overflow-y-auto font-mono text-sm space-y-1 custom-scrollbar">
              {liveLogs.length === 0 && (
                <p className="text-slate-500 text-center py-8">No recent logs. Analyze some logs to see them appear here.</p>
              )}
              {liveLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-slate-800/50 transition">
                  <span className="text-slate-500 text-xs shrink-0 mt-0.5">
                    [{new Date(log.createdAt).toLocaleTimeString()}]
                  </span>
                  <span className="text-lg mt-[-2px]">
                    {log.category === "ERROR" ? "🔴" : log.category === "WARNING" ? "🟡" : "🟢"}
                  </span>
                  <span className={`font-bold text-xs uppercase mr-1 mt-0.5 ${
                    log.category === "ERROR" ? "text-red-400" : log.category === "WARNING" ? "text-yellow-400" : "text-emerald-400"
                  }`}>{log.category}:</span>
                  <span className="text-slate-300 truncate">{log.errorSummary || log.logText?.slice(0, 100)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* Trend Chart */}
           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
               <FiTrendingUp className="mr-2 text-emerald-600" /> Error Trends (Last 7 Days)
             </h2>
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData.trendData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                   <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Legend wrapperStyle={{ paddingTop: '20px' }} />
                   <Line type="monotone" dataKey="Errors" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                   <Line type="monotone" dataKey="Warnings" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                   <Line type="monotone" dataKey="Info" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Category Pie */}
           <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
               <FiBarChart2 className="mr-2 text-emerald-600" /> Categories
             </h2>
             <div className="h-80 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={chartData.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                     {chartData.categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                   <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Severity Distribution */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <FiAlertCircle className="mr-2 text-emerald-600" /> Severity Distribution
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.severityData || []} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                    {(chartData.severityData || []).map((entry, index) => (
                      <Cell key={`sev-${index}`} fill={SEVERITY_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Error Patterns Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <FiTrendingUp className="mr-2 text-emerald-600" /> Top Error Patterns
            </h2>
            <div className="h-64 w-full">
              {(chartData.topPatterns || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.topPatterns} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis dataKey="name" type="category" width={150} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                  No error patterns detected yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Classification Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900">Classification History</h2>
              <ExportButtons 
                data={filteredLogs.map(l => ({ summary: l.errorSummary, category: l.category, confidence: l.confidence, severity: l.severity?.level, date: l.createdAt }))} 
                filename="dashboard-logs" 
                title="Log Classification Report" 
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" placeholder="Search logs..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full"
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 appearance-none bg-white font-medium text-slate-700 outline-none cursor-pointer">
                  <option value="ALL">All Categories</option>
                  <option value="ERROR">Errors</option>
                  <option value="WARNING">Warnings</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer bg-white">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="severity">Highest Severity</option>
                <option value="confidence-high">Highest Confidence</option>
                <option value="confidence-low">Lowest Confidence</option>
              </select>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 outline-none" placeholder="From" />
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 outline-none" placeholder="To" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Summary / Log</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedLogs.map((log, index) => (
                  <tr key={index} onClick={() => router.push(`/dashboard/logs/${log._id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="py-4 px-6">
                      <div className="max-w-lg">
                        {log.errorSummary && <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">{log.errorSummary}</p>}
                        <p className={`text-xs mt-1 font-mono text-slate-500 truncate ${!log.errorSummary ? 'font-medium text-sm text-slate-700' : ''}`}>
                          {log.logText}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border ${
                        log.category === "ERROR" ? "bg-red-50 text-red-600 border-red-200" :
                        log.category === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>{log.category || "UNKNOWN"}</span>
                    </td>
                    <td className="py-4 px-6">
                      {log.severity ? (
                        <span className="flex items-center gap-1.5 text-sm">
                          <span>{log.severity.emoji}</span>
                          <span className="font-bold" style={{ color: log.severity.color }}>{log.severity.score}/10</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3 max-w-[120px]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${log.category === "ERROR" ? "bg-red-500" : log.category === "WARNING" ? "bg-yellow-500" : "bg-emerald-500"}`}
                            style={{ width: `${log.confidence || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-8">{log.confidence || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-500 flex items-center justify-between">
                      {new Date(log.createdAt).toLocaleString()}
                      <FiArrowRight className="text-slate-300 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))}
                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                      <FiSearch className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                      No classifications match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Showing {((page-1)*perPage)+1}–{Math.min(page*perPage, filteredLogs.length)} of {filteredLogs.length} logs
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                <FiChevronLeft />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition ${p === page ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
      `}} />
    </div>
  );
}