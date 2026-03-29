"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft, FiAlertCircle, FiCheckCircle, FiCode, FiFileText,
  FiClock, FiTarget, FiCpu, FiLayers
} from "react-icons/fi";
import ExportButtons from "@/app/components/ExportButtons";

export default function LogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchLog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/logs/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Log not found");
        setLog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading log analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Log Not Found</h2>
          <p className="text-slate-500 mb-6">{error || "This log entry doesn't exist."}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryStyle = (cat) => {
    switch(cat) {
      case "ERROR": return "bg-red-50 text-red-700 border-red-200";
      case "WARNING": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm mb-3 transition">
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Log Analysis Detail</h1>
            <p className="text-slate-500 font-medium mt-1">
              <FiClock className="inline mr-1 -mt-0.5" />
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
          <ExportButtons data={log} filename={`log-${params.id}`} title="Log Detail Report" />
        </div>

        {/* Meta Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Category */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Category</p>
            <span className={`inline-flex px-3 py-1.5 text-sm font-bold uppercase rounded-lg border ${getCategoryStyle(log.category)}`}>
              {log.category || "UNKNOWN"}
            </span>
          </div>
          {/* Confidence */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Confidence</p>
            <p className="text-2xl font-extrabold text-slate-900">{log.confidence || 0}%</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${log.confidence || 0}%` }}></div>
            </div>
          </div>
          {/* Severity */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Severity</p>
            {log.severity ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{log.severity.emoji}</span>
                <div>
                  <p className="text-lg font-extrabold text-slate-900">{log.severity.score}/10</p>
                  <p className="text-xs font-bold" style={{ color: log.severity.color }}>{log.severity.level}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 font-medium">N/A</p>
            )}
          </div>
          {/* Classifier */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Method</p>
            <p className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FiCpu className="text-emerald-600" /> 
              {log.classifiers ? "Ensemble" : "Single"}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {log.classifiers ? `${log.classifiers.length - 1} classifiers` : "Gemini AI"}
            </p>
          </div>
        </div>

        {/* Classifier Comparison Table */}
        {log.classifiers && log.classifiers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiTarget className="text-emerald-600" /> Multi-Model Classification Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-6 text-slate-500 font-bold text-xs uppercase">Method</th>
                    <th className="text-left py-3 px-6 text-slate-500 font-bold text-xs uppercase">Category</th>
                    <th className="text-left py-3 px-6 text-slate-500 font-bold text-xs uppercase">Confidence</th>
                    <th className="text-left py-3 px-6 text-slate-500 font-bold text-xs uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {log.classifiers.map((clf, idx) => {
                    const isWinner = clf.method === "Combined";
                    return (
                      <tr key={idx} className={`border-b border-slate-50 ${isWinner ? "bg-emerald-50/50" : "hover:bg-slate-50"} transition-colors`}>
                        <td className="py-3.5 px-6 font-bold text-slate-800">
                          <span className="mr-2">{clf.icon}</span>{clf.method}
                          {isWinner && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">FINAL</span>}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border ${getCategoryStyle(clf.category)}`}>
                            {clf.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                              <div 
                                className={`h-full rounded-full ${
                                  clf.confidence >= 80 ? "bg-emerald-500" : clf.confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${clf.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{clf.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500 font-mono text-xs">
                          {clf.timeMs < 1 ? "<1ms" : `${clf.timeMs}ms`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error Summary */}
        {log.errorSummary && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-red-50/30">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <FiAlertCircle /> Error Summary
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-800 font-medium leading-relaxed">{log.errorSummary}</p>
            </div>
          </div>
        )}

        {/* Full Log Text */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiFileText className="text-emerald-600" /> Full Log Text
            </h2>
          </div>
          <div className="p-2">
            <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl font-mono text-sm overflow-auto max-h-[300px] leading-relaxed">
              {log.logText}
            </pre>
          </div>
        </div>

        {/* Root Cause */}
        {log.rootCause && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiLayers className="text-emerald-600" /> Root Cause Analysis
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{log.rootCause}</p>
            </div>
          </div>
        )}

        {/* Resolution Steps */}
        {log.resolutionSteps && log.resolutionSteps.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-600" /> Resolution Steps
              </h2>
            </div>
            <div className="p-6">
              <ol className="space-y-4">
                {log.resolutionSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Corrected Code */}
        {log.correctedCode && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiCode className="text-blue-600" /> Corrected Code
              </h2>
              <button 
                onClick={() => navigator.clipboard.writeText(log.correctedCode)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg border border-slate-200 transition"
              >
                Copy Code
              </button>
            </div>
            
            {/* Side-by-side: Original vs Fixed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {log.sourceCode && (
                <div className="border-r border-slate-200">
                  <div className="px-4 py-2 bg-red-50 border-b border-slate-200">
                    <p className="text-xs font-bold text-red-600 uppercase">Original (Before)</p>
                  </div>
                  <pre className="p-4 font-mono text-sm text-slate-800 overflow-auto max-h-[400px] bg-red-50/20">
                    <code>{log.sourceCode}</code>
                  </pre>
                </div>
              )}
              <div>
                <div className="px-4 py-2 bg-emerald-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Corrected (After)</p>
                </div>
                <pre className="p-4 font-mono text-sm text-slate-800 overflow-auto max-h-[400px] bg-emerald-50/20">
                  <code>{log.correctedCode}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
