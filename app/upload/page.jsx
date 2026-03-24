"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { 
  FiUpload, 
  FiFileText, 
  FiCpu, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiXCircle,
  FiActivity,
  FiTrendingUp,
  FiCopy,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiTag,
  FiBarChart2
} from "react-icons/fi";

export default function UploadPage() {
  const { user } = useAuth();
  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const analyzeLog = async () => {
    if (!log.trim()) {
      setError("Please enter a log to analyze");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          log,
          userId: user?.id
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setLog("");
    setResult(null);
    setError("");
  };

  const getConfidenceColor = (confidence) => {
    const num = parseFloat(confidence) || 0;
    if (num >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (num >= 70) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'error':
        return <FiXCircle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="w-8 h-8 text-yellow-500" />;
      case 'info':
        return <FiCheckCircle className="w-8 h-8 text-emerald-500" />;
      default:
        return <FiActivity className="w-8 h-8 text-teal-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Log Analysis
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Paste your system log below for instant AI-powered classification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <FiFileText className="mr-3 text-emerald-600" />
                  Input Log Document
                </h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  {log.length} Chars
                </span>
              </div>

              <textarea
                className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all font-mono text-sm text-slate-700 placeholder-slate-400 resize-none font-medium leading-relaxed"
                placeholder={`Paste your system log here...
                
Example: 
2024-01-15 10:30:45 ERROR: Database connection timeout in module UserAuth`}
                value={log}
                onChange={(e) => setLog(e.target.value)}
                disabled={loading}
              />

              {error && (
                <div className="mt-5 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 text-sm font-bold flex items-center">
                    <FiAlertCircle className="mr-2 flex-shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={analyzeLog}
                  disabled={loading || !log.trim()}
                  className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin w-5 h-5" />
                      <span>Running Analysis...</span>
                    </>
                  ) : (
                    <>
                      <FiCpu className="w-5 h-5" />
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  className="px-8 py-4 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors font-bold shadow-sm"
                >
                  Clear
                </button>
              </div>

              {/* Sample Logs */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Try a Sample Log:</p>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Database connection timeout",
                    "User authentication failed",
                    "Cache hit ratio: 95%",
                    "Disk space warning: 85% full"
                  ].map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setLog(sample)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6 h-full">
            {result ? (
              <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 border border-slate-200 h-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <FiActivity className="mr-3 text-emerald-600" />
                    Analysis Report
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCopyResult}
                      className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors relative text-slate-600"
                      title="Copy result JSON"
                    >
                      <FiCopy className="w-4 h-4" />
                      {copied && (
                        <span className="absolute -top-10 -right-2 bg-slate-900 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                          Copied!
                        </span>
                      )}
                    </button>
                    <button
                      className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-colors text-slate-600"
                      title="Download Report"
                    >
                      <FiDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Result Card */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                      {getCategoryIcon(result.category)}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {result.category || "Unknown"}
                        </h3>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shrink-0 ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}% Confidence
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">
                        {result.description || "Log analysis complete without detailed description."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
                    <FiBarChart2 className="mr-2.5 text-emerald-600" />
                    Detailed Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">
                        <FiFileText className="mr-2" size={16} />
                        Log Length
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900">{log.length} <span className="text-sm font-bold text-slate-400">chars</span></p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">
                        <FiTag className="mr-2" size={16} />
                        Word Count
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900">{log.split(/\s+/).length} <span className="text-sm font-bold text-slate-400">words</span></p>
                    </div>
                  </div>

                  {/* Keywords/Entities */}
                  {result.keywords && result.keywords.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Key Terms Identified</p>
                      <div className="flex flex-wrap gap-2.5">
                        {result.keywords.map((keyword, index) => (
                          <span key={index} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-bold border border-teal-100">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions && (
                    <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wider flex items-center">
                        <FiTrendingUp className="mr-1.5" /> Recommended Steps
                      </p>
                      <p className="text-sm font-medium text-indigo-900 leading-relaxed">{result.suggestions}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-6 border-t border-slate-100">
                    <p>Analyzed at: {new Date().toLocaleString()}</p>
                    <p className="flex items-center bg-slate-100 px-2.5 py-1 rounded-md text-slate-500">
                      Model: BERT Ensemble Pipeline
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm p-12 border border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-8 ring-8 ring-emerald-50/50">
                  <FiUpload className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
                  Ready to Analyze
                </h3>
                <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                  Paste your system log on the left side and click <strong className="text-slate-700">"Start Analysis"</strong> to securely process your log data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 ring-1 ring-teal-100">
              <FiTrendingUp className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="font-extrabold text-slate-900 mb-3 text-lg">Multi-Model Engine</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">Combines Regex, NLP, & BERT models to ensure high accuracy for every log format.</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
             <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 ring-1 ring-emerald-100">
              <FiActivity className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-slate-900 mb-3 text-lg">Real-time Processing</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">Instant results with exact confidence scores and detailed remediation explanations.</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 ring-1 ring-indigo-100">
              <FiFileText className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="font-extrabold text-slate-900 mb-3 text-lg">Format Agnostic</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">Seamlessly parse standard log formats, custom stack traces, and database errors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}