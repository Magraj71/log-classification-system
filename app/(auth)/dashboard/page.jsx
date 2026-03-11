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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Here's what's happening with your log classification system
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition border border-gray-700 text-gray-200">
              <FiUpload className="text-blue-400" />
              <span>Upload Logs</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition">
              <FiActivity className="text-white" />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Logs Card */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Logs</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalLogs.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-400">
              <FiTrendingUp className="mr-1" />
              <span>+12% from last week</span>
            </div>
          </div>

          {/* Processed Card */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Processed</p>
                <p className="text-3xl font-bold text-white">
                  {stats.processed.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-400">
              <span>
                {((stats.processed / stats.totalLogs) * 100).toFixed(1)}% completion rate
              </span>
            </div>
          </div>

          {/* Errors Card */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Errors</p>
                <p className="text-3xl font-bold text-red-400">
                  {stats.errors}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center">
                <FiXCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-400">
              <FiAlertCircle className="mr-1" />
              <span>Need attention</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-purple-400">
                  {stats.accuracy}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-400">
              <span>Above target (95%)</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiClock className="mr-2 text-blue-400" />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {logs.slice(0, 3).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">{log.logText?.slice(0, 50)}...</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log.category === "ERROR" ? "bg-red-900/50 text-red-400" :
                        log.category === "WARNING" ? "bg-yellow-900/50 text-yellow-400" :
                        "bg-green-900/50 text-green-400"
                      }`}>
                        {log.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <FiArrowRight className="text-gray-500" />
                </div>
              ))}
            </div>

            <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
              View all activity
              <FiArrowRight className="ml-1" />
            </button>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <Link
                href="/upload"
                className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition group"
              >
                <div className="flex items-center space-x-3">
                  <FiUpload className="text-blue-400 group-hover:scale-110 transition" />
                  <span className="text-gray-200 group-hover:text-white">
                    Upload new logs
                  </span>
                </div>
              </Link>

              <Link
                href="/reports"
                className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition group"
              >
                <div className="flex items-center space-x-3">
                  <FiBarChart2 className="text-purple-400 group-hover:scale-110 transition" />
                  <span className="text-gray-200 group-hover:text-white">
                    View reports
                  </span>
                </div>
              </Link>

              <Link
                href="/settings"
                className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition group"
              >
                <div className="flex items-center space-x-3">
                  <FiSettings className="text-gray-400 group-hover:scale-110 transition" />
                  <span className="text-gray-200 group-hover:text-white">
                    Settings
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                className="w-full p-3 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition group text-left"
              >
                <div className="flex items-center space-x-3">
                  <FiLogOut className="text-red-400 group-hover:scale-110 transition" />
                  <span className="text-red-400">Logout</span>
                </div>
              </button>
            </div>

            {/* System Status */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-white mb-3">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">API</span>
                  <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Deepseek R1</span>
                  <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Database</span>
                  <span className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Classifications Table */}
        <div className="mt-8 bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Classifications
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-400">
                    Log File
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">
                    Classification
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">
                    Confidence
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <td className="py-3 text-sm text-gray-300">
                      {log.logText?.slice(0, 30)}...
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full 
                          ${
                            log.category === "ERROR"
                              ? "bg-red-900/50 text-red-400"
                              : log.category === "WARNING"
                                ? "bg-yellow-900/50 text-yellow-400"
                                : "bg-green-900/50 text-green-400"
                          }`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {log.confidence}
                    </td>
                    <td className="py-3 text-sm text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}