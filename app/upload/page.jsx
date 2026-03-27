"use client";

import { useState } from "react";
import { 
  FiFileText, 
  FiCpu, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiSearch, 
  FiCode,
  FiUpload,
  FiTerminal
} from "react-icons/fi";

export default function LogAnalysisPage() {
  const [logData, setLogData] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!logData.trim()) {
      setError("Please paste an error log first.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/logs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logData, sourceCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze log");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setter(event.target.result);
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 font-sans p-4 md:p-8">
      
      <div className="mb-6 text-center md:text-left flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-xl">
          <FiCpu className="text-emerald-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Log Analyzer & Fixer</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">Paste your logs and code, and let AI deploy the fix.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-full">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="flex flex-col space-y-6">
          {/* Error Log Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full ring-1 ring-slate-100 p-1">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-1">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <FiTerminal size={18} /> Error Log / Stack Trace
              </div>
              <label className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 shadow-sm">
                <FiUpload /> Upload .log
                <input type="file" className="hidden" accept=".log,.txt,text/plain" onChange={(e) => handleFileUpload(e, setLogData)} />
              </label>
            </div>
            <textarea
              className="flex-1 w-full outline-none resize-y min-h-[220px] p-4 font-mono text-sm text-slate-800 bg-white placeholder-slate-300"
              placeholder="Paste raw error log, trace, or JSON error payload..."
              value={logData}
              onChange={(e) => setLogData(e.target.value)}
            />
          </div>

          {/* Source Code Input */}
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

          {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold flex items-center"><FiAlertCircle className="mr-2" />{error}</div>}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 ${
              loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing & Fixing...</span>
              </>
            ) : (
              <>
                <FiSearch className="h-5 w-5" />
                <span>Analyze & Fix Code</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: AI RESULTS */}
        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-full min-h-[600px] relative">
          {!result && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <FiCpu className="w-16 h-16 mb-4 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">Awaiting Instructions</h3>
              <p className="max-w-xs">Provide a log and optional source code to view the AI analysis and corrected code here.</p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex flex-col p-6 space-y-6">
               <div className="h-20 bg-slate-800 rounded-xl animate-pulse"></div>
               <div className="h-32 bg-slate-800/80 rounded-xl animate-pulse delay-75"></div>
               <div className="flex-1 bg-slate-800/60 rounded-xl animate-pulse delay-150"></div>
            </div>
          )}

          {result && (
            <div className="p-6 overflow-y-auto h-full space-y-6 custom-scrollbar">
              
              {/* Summary */}
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
        </div>

      </div>
      
      {/* Custom Styles for right panel scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}} />
    </div>
  );
}