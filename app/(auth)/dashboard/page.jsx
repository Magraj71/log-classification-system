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
} from "react-icons/fi";

export default function Dashboard() {
  const { user, token, loading, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalLogs: 1247,
    processed: 982,
    errors: 124,
    warnings: 141,
    accuracy: 98.5,
  });

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading]);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, []);

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
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}! 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Here's what's happening with your log classification system
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="mt-6 md:mt-0 flex space-x-3">
            <button className="flex items-center space-x-2 bg-white px-5 py-2.5 rounded-xl hover:bg-slate-50 transition border border-slate-200 text-slate-700 font-bold shadow-sm hover:shadow">
              <FiUpload className="text-emerald-600 w-5 h-5" />
              <span>Upload Logs</span>
            </button>
            <button className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition transform hover:-translate-y-0.5">
              <FiActivity className="text-white w-5 h-5" />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Logs Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Logs</p>
                <p className="text-3xl font-extrabold text-slate-900">
                  {stats.totalLogs.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-emerald-100/50">
                <FiFileText className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="mt-5 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
              <FiTrendingUp className="mr-1.5" />
              <span>+12% from last week</span>
            </div>
          </div>

          {/* Processed Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:border-teal-200 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Processed</p>
                <p className="text-3xl font-extrabold text-slate-900">
                  {stats.processed.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center ring-1 ring-teal-100/50">
                <FiCheckCircle className="w-7 h-7 text-teal-600" />
              </div>
            </div>
            <div className="mt-5 flex items-center text-sm font-bold text-slate-600">
              <span>
                {((stats.processed / stats.totalLogs) * 100).toFixed(1)}% completion rate
              </span>
            </div>
          </div>

          {/* Errors Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:border-red-200 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Errors</p>
                <p className="text-3xl font-extrabold text-slate-900">
                  {stats.errors}
                </p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center ring-1 ring-red-100/50">
                <FiXCircle className="w-7 h-7 text-red-600" />
              </div>
            </div>
            <div className="mt-5 flex items-center text-sm font-bold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-md">
              <FiAlertCircle className="mr-1.5" />
              <span>Need attention</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-md transition duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Accuracy</p>
                <p className="text-3xl font-extrabold text-slate-900">
                  {stats.accuracy}%
                </p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-emerald-100/50">
                <FiBarChart2 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="mt-5 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
              <span>Above target (95%)</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <FiClock className="mr-2.5 text-emerald-600" />
              Recent Activity
            </h2>

            <div className="space-y-3">
              {logs.slice(0, 3).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium font-mono text-sm">{log.logText?.slice(0, 60)}...</p>
                    <div className="flex items-center mt-3 space-x-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        log.category === "ERROR" ? "bg-red-100 text-red-700" :
                        log.category === "WARNING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {log.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <FiArrowRight className="text-slate-400 group-hover:text-emerald-500 transition-colors ml-4" />
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-slate-500 font-medium">No recent activity found. Upload some logs to get started.</p>
                </div>
              )}
            </div>

            <button className="mt-6 text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center transition-colors">
              View all activity
              <FiArrowRight className="ml-1" />
            </button>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Quick Menu
            </h2>

            <div className="space-y-2.5">
              <Link
                href="/upload"
                className="block p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-emerald-600 transition-all">
                    <FiUpload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">
                    Upload new logs
                  </span>
                </div>
              </Link>

              <Link
                href="/reports"
                className="block p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-teal-50 hover:border-teal-100 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-teal-600 transition-all">
                    <FiBarChart2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-teal-800 transition-colors">
                    View reports
                  </span>
                </div>
              </Link>

              <Link
                href="/profile"
                className="block p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-slate-500 transition-all">
                    <FiSettings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Settings
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                className="w-full text-left p-3.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all group mt-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow text-red-500 transition-all">
                    <FiLogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                  <span className="font-bold text-red-600">Logout Securely</span>
                </div>
              </button>
            </div>

            {/* System Status */}
            <div className="mt-8 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">API Gateway</span>
                  <span className="flex items-center font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Engine (LLM)</span>
                  <span className="flex items-center font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">Database</span>
                  <span className="flex items-center font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Classifications Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 border border-slate-200 overflow-hidden">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            Recent Classifications
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Log Message</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Classification</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-slate-700 font-mono truncate max-w-sm">
                        {log.logText}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                        log.category === "ERROR" ? "bg-red-50 text-red-600 border border-red-100" :
                        log.category === "WARNING" ? "bg-yellow-50 text-yellow-700 border border-yellow-100" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${log.category === "ERROR" ? "bg-red-500" : log.category === "WARNING" ? "bg-yellow-500" : "bg-emerald-500"}`}
                            style={{ width: `${log.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700">{log.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">
                      No classifications found yet.
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