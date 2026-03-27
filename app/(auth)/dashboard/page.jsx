"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiActivity,
  FiFileText,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiUpload,
  FiSettings,
  FiLogOut,
  FiArrowRight,
  FiSearch,
  FiFilter
} from "react-icons/fi";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Red for Error, Yellow/Amher for Warning, Green for Info

export default function Dashboard() {
  const { user, token, loading, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState({ trendData: [], categoryData: [] });
  const router = useRouter();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const [stats, setStats] = useState({
    totalLogs: 0,
    processed: 0,
    errors: 0,
    warnings: 0,
    accuracy: 0,
  });

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  useEffect(() => {
    // Fetch logs and basic stats
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error(err));

    // Fetch advanced chart stats
    fetch("/api/logs/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.trendData) setChartData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (log.errorSummary || "").toLowerCase().includes(term) ||
      (log.logText || "").toLowerCase().includes(term) ||
      (log.rootCause || "").toLowerCase().includes(term);
    
    const matchesCategory = filterCategory === "ALL" || log.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Monitor and analyze your application's health
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex space-x-3">
            <Link href="/upload" className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition transform hover:-translate-y-0.5">
              <FiActivity className="text-white w-5 h-5" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Logs Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Analyzed Logs</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-emerald-100/50">
                <FiFileText className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Critical Errors Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Critical Errors</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.errors.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center ring-1 ring-red-100/50">
                <FiXCircle className="w-7 h-7 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-bold text-red-600">
              <FiAlertCircle className="mr-1.5" /> Require attention
            </div>
          </div>

          {/* Warnings Card */}
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

          {/* AI Accuracy Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">AI Confidence</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.accuracy}%</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center ring-1 ring-blue-100/50">
                <FiBarChart2 className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-bold text-blue-600">
              <span>Average classification confidence</span>
            </div>
          </div>
        </div>

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
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend wrapperStyle={{ paddingTop: '20px' }} />
                   <Line type="monotone" dataKey="Errors" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                   <Line type="monotone" dataKey="Warnings" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                   <Line type="monotone" dataKey="Info" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Distribution Pie Chart */}
           <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
               <FiBarChart2 className="mr-2 text-emerald-600" /> Category Distribution
             </h2>
             <div className="h-80 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData.categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {chartData.categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend verticalAlign="bottom" height={36} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        {/* Complete Classification Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
              Classification History
            </h2>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full md:w-64"
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 appearance-none bg-white font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="ERROR">Errors</option>
                  <option value="WARNING">Warnings</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">AI Summary / Log</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log, index) => (
                  <tr
                    key={index}
                    onClick={() => router.push(`/dashboard/logs/${log._id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="max-w-lg">
                        {log.errorSummary ? (
                           <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">{log.errorSummary}</p>
                        ) : null}
                        <p className={`text-xs mt-1 font-mono text-slate-500 truncate ${!log.errorSummary ? 'font-medium text-sm text-slate-700' : ''}`}>
                          {log.logText}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 mt-2">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border ${
                        log.category === "ERROR" ? "bg-red-50 text-red-600 border-red-200" :
                        log.category === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {log.category || "UNKNOWN"}
                      </span>
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
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                      <FiSearch className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                      No classifications match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}