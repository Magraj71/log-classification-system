"use client";

import { useState, useRef } from "react";
import { 
  FiFileText, FiCpu, FiAlertCircle, FiCheckCircle, FiSearch, FiCode,
  FiUpload, FiTerminal, FiChevronDown, FiChevronUp, FiZap, FiLayers,
  FiClock, FiTarget, FiTrendingUp, FiBox
} from "react-icons/fi";
import ExportButtons from "../components/ExportButtons";
import { SAMPLE_LOGS } from "../lib/sampleLogs";

export default function LogAnalysisPage() {
  const [logData, setLogData] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showSamples, setShowSamples] = useState(false);
  
  // Bulk mode
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!logData.trim()) {
      setError("Please paste an error log first.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/logs/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ logData, sourceCode })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze log");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAnalyze = async () => {
    if (!logData.trim()) {
      setError("Please paste or upload a log file first.");
      return;
    }
    setError(null);
    setBulkLoading(true);
    setBulkResults(null);
    setBulkProgress(10);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      setBulkProgress(30);
      const response = await fetch("/api/logs/bulk", {
        method: "POST",
        headers,
        body: JSON.stringify({ logText: logData })
      });

      setBulkProgress(80);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bulk processing failed");
      setBulkProgress(100);
      setBulkResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setter(event.target.result);
    reader.readAsText(file);
    e.target.value = null;
  };

  const loadSample = (sample) => {
    setLogData(sample.logData);
    setSourceCode(sample.sourceCode || "");
    setShowSamples(false);
    setResult(null);
    setBulkResults(null);
    setError(null);
  };

  const getCategoryStyle = (cat) => {
    switch(cat) {
      case "ERROR": return "bg-red-50 text-red-700 border-red-200";
      case "WARNING": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 font-sans p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <FiCpu className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Log Analyzer & Fixer</h1>
            <p className="text-slate-500 text-sm md:text-base font-medium">Multi-model analysis: Regex + NLP + Gemini AI</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          <button
            onClick={() => { setMode("single"); setBulkResults(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === "single" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-emerald-700"}`}
          >
            <FiSearch className="inline mr-1.5 -mt-0.5" /> Single Log
          </button>
          <button
            onClick={() => { setMode("bulk"); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === "bulk" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-emerald-700"}`}
          >
            <FiLayers className="inline mr-1.5 -mt-0.5" /> Bulk Analysis
          </button>
        </div>
      </div>

      {/* Sample Logs Section */}
      <div className="mb-6">
        <button 
          onClick={() => setShowSamples(!showSamples)}
          className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 transition-all"
        >
          <FiZap className="w-4 h-4" />
          Try Sample Logs
          {showSamples ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
        </button>

        {showSamples && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 animate-in">
            {SAMPLE_LOGS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSample(sample)}
                className={`p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  sample.category === "ERROR" ? "border-red-200 bg-white hover:border-red-300 hover:bg-red-50/30" :
                  sample.category === "WARNING" ? "border-yellow-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/30" :
                  "border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
                }`}
              >
                <div className="text-lg mb-1">{sample.icon}</div>
                <p className="text-xs font-bold text-slate-900 leading-tight">{sample.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{sample.description}</p>
                <span className={`inline-block mt-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${getCategoryStyle(sample.category)}`}>
                  {sample.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="flex flex-col space-y-6">
          {/* Error Log Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full ring-1 ring-slate-100 p-1">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-1">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <FiTerminal size={18} /> {mode === "bulk" ? "Log File Content (Multiple Lines)" : "Error Log / Stack Trace"}
              </div>
              <label className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 shadow-sm">
                <FiUpload /> Upload .log
                <input type="file" className="hidden" accept=".log,.txt,text/plain" onChange={(e) => handleFileUpload(e, setLogData)} />
              </label>
            </div>
            <textarea
              className="flex-1 w-full outline-none resize-y min-h-[220px] p-4 font-mono text-sm text-slate-800 bg-white placeholder-slate-300"
              placeholder={mode === "bulk" 
                ? "Paste a full log file (each line will be classified separately)..." 
                : "Paste raw error log, trace, or JSON error payload..."}
              value={logData}
              onChange={(e) => setLogData(e.target.value)}
            />
          </div>

          {/* Source Code Input (only in single mode) */}
          {mode === "single" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full ring-1 ring-slate-100 p-1">
              <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-1">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <FiCode size={18} /> Original Source Code <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                </div>
                <label className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 shadow-sm">
                  <FiUpload /> Upload Code
                  <input type="file" className="hidden" accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.txt" onChange={(e) => handleFileUpload(e, setSourceCode)} />
                </label>
              </div>
              <textarea
                className="flex-1 w-full outline-none resize-y min-h-[220px] p-4 font-mono text-sm text-slate-800 bg-white placeholder-slate-300"
                placeholder="Paste the function or file content related to the error..."
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
              />
            </div>
          )}

          {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold flex items-center"><FiAlertCircle className="mr-2 shrink-0" />{error}</div>}

          {/* Analyze Button */}
          <button
            onClick={mode === "bulk" ? handleBulkAnalyze : handleAnalyze}
            disabled={loading || bulkLoading}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${
              (loading || bulkLoading) ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20"
            }`}
          >
            {(loading || bulkLoading) ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{mode === "bulk" ? "Processing Logs..." : "Analyzing & Fixing..."}</span>
              </>
            ) : (
              <>
                {mode === "bulk" ? <FiLayers className="h-5 w-5" /> : <FiSearch className="h-5 w-5" />}
                <span>{mode === "bulk" ? "Process All Logs" : "Analyze & Fix Code"}</span>
              </>
            )}
          </button>

          {/* Bulk Progress Bar */}
          {bulkLoading && (
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                <span>Processing logs...</span>
                <span>{bulkProgress}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${bulkProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-full min-h-[600px] relative">
          
          {/* Empty State */}
          {!result && !bulkResults && !loading && !bulkLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <FiCpu className="w-16 h-16 mb-4 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">Awaiting Instructions</h3>
              <p className="max-w-xs">Provide a log and optional source code to view the AI analysis and corrected code here.</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {(loading || bulkLoading) && (
            <div className="absolute inset-0 flex flex-col p-6 space-y-6">
               <div className="h-20 bg-slate-800 rounded-xl animate-pulse"></div>
               <div className="h-32 bg-slate-800/80 rounded-xl animate-pulse delay-75"></div>
               <div className="flex-1 bg-slate-800/60 rounded-xl animate-pulse delay-150"></div>
            </div>
          )}

          {/* ===== SINGLE ANALYSIS RESULT ===== */}
          {result && mode === "single" && (
            <div className="p-6 overflow-y-auto h-full space-y-6 custom-scrollbar">
              
              {/* Export Buttons */}
              <div className="flex justify-end">
                <ExportButtons data={result} filename="log-analysis" title="Log Analysis Report" />
              </div>

              {/* Classification Comparison Table */}
              {result.classifiers && result.classifiers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiTarget /> Multi-Model Classification Comparison
                  </h3>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase">Method</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase">Category</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase">Confidence</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-bold text-xs uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.classifiers.map((clf, idx) => {
                          const isWinner = clf.method === "Combined";
                          return (
                            <tr key={idx} className={`border-b border-slate-700/50 ${isWinner ? "bg-emerald-500/10" : "hover:bg-slate-700/30"} transition-colors`}>
                              <td className="py-3 px-4 font-bold text-slate-200">
                                <span className="mr-2">{clf.icon}</span>{clf.method}
                                {isWinner && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">FINAL</span>}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold uppercase rounded border ${
                                  clf.category === "ERROR" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                  clf.category === "WARNING" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }`}>
                                  {clf.category}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden max-w-[80px]">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        clf.confidence >= 80 ? "bg-emerald-500" : clf.confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
                                      }`}
                                      style={{ width: `${clf.confidence}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-slate-300 font-bold text-xs w-10">{clf.confidence}%</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-mono text-xs">
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

              {/* Severity Badge */}
              {result.severity && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  result.severity.score >= 9 ? "bg-red-500/10 border-red-500/20" :
                  result.severity.score >= 7 ? "bg-orange-500/10 border-orange-500/20" :
                  result.severity.score >= 4 ? "bg-yellow-500/10 border-yellow-500/20" :
                  "bg-emerald-500/10 border-emerald-500/20"
                }`}>
                  <span className="text-2xl">{result.severity.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Severity Score</p>
                    <p className="text-lg font-extrabold text-slate-200">{result.severity.score}/10 — {result.severity.level}</p>
                  </div>
                </div>
              )}

              {/* Error Summary */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4">
                <FiAlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1">Error Summary</h3>
                  <p className="text-red-100 font-medium">{result.errorSummary}</p>
                </div>
              </div>

              {/* Root Cause */}
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiFileText /> Root Cause Analysis
                </h3>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.rootCause}</p>
                </div>
              </div>

              {/* Resolution Steps */}
              <div>
                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiCheckCircle /> Resolution Steps
                </h3>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <ul className="space-y-3">
                    {result.resolutionSteps?.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-teal-400 font-bold text-xs mt-0.5 ring-1 ring-slate-600">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Corrected Code */}
              {result.correctedCode && (
                <div className="flex flex-col flex-1 min-h-[250px]">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FiCode /> Corrected Output / Fix
                  </h3>
                  <div className="bg-[#0d1117] border border-slate-700 rounded-xl overflow-hidden flex-1 relative group">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => navigator.clipboard.writeText(result.correctedCode)}
                         className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-600 shadow-lg"
                       >
                         Copy Code
                       </button>
                    </div>
                    <pre className="p-4 font-mono text-sm text-[#c9d1d9] overflow-auto h-full">
                      <code>{result.correctedCode}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== BULK ANALYSIS RESULTS ===== */}
          {bulkResults && mode === "bulk" && (
            <div className="p-6 overflow-y-auto h-full space-y-6 custom-scrollbar">
              
              {/* Export */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-200">Bulk Analysis Complete</h3>
                <ExportButtons 
                  data={bulkResults.results.map(r => ({ text: r.logText, category: r.category, confidence: r.confidence, severity: r.severity?.level }))} 
                  filename="bulk-log-analysis" 
                  title="Bulk Log Analysis Report" 
                />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                  <p className="text-2xl font-extrabold text-slate-100">{bulkResults.summary.total}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">Total Processed</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 text-center">
                  <p className="text-2xl font-extrabold text-red-400">{bulkResults.summary.ERROR || 0}</p>
                  <p className="text-xs font-bold text-red-400/60 uppercase mt-1">Errors</p>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 text-center">
                  <p className="text-2xl font-extrabold text-yellow-400">{bulkResults.summary.WARNING || 0}</p>
                  <p className="text-xs font-bold text-yellow-400/60 uppercase mt-1">Warnings</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 text-center">
                  <p className="text-2xl font-extrabold text-emerald-400">{bulkResults.summary.INFO || 0}</p>
                  <p className="text-xs font-bold text-emerald-400/60 uppercase mt-1">Info</p>
                </div>
              </div>

              {/* Avg Confidence */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
                <FiTrendingUp className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Average Confidence</p>
                  <p className="text-xl font-extrabold text-slate-200">{bulkResults.summary.avgConfidence}%</p>
                </div>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden ml-4">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${bulkResults.summary.avgConfidence}%` }}></div>
                </div>
              </div>

              {/* Results Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Individual Results ({bulkResults.results.length} entries)</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {bulkResults.results.map((r, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3 hover:bg-slate-750 transition">
                      <span className="text-xs font-bold text-slate-500 w-8 text-right">#{r.index}</span>
                      <span className="text-lg">{r.severity?.emoji || "⚪"}</span>
                      <p className="flex-1 text-sm text-slate-300 font-mono truncate">{r.logText}</p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${
                        r.category === "ERROR" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        r.category === "WARNING" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}>{r.category}</span>
                      <span className="text-xs font-bold text-slate-400 w-12 text-right">{r.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        @keyframes animate-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: animate-in 0.3s ease-out; }
      `}} />
    </div>
  );
}