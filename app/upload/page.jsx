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
    if (num >= 90) return "text-green-400 bg-green-900/30 border-green-500/30";
    if (num >= 70) return "text-yellow-400 bg-yellow-900/30 border-yellow-500/30";
    return "text-red-400 bg-red-900/30 border-red-500/30";
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'error':
        return <FiXCircle className="w-8 h-8 text-red-400" />;
      case 'warning':
        return <FiAlertCircle className="w-8 h-8 text-yellow-400" />;
      case 'info':
        return <FiCheckCircle className="w-8 h-8 text-green-400" />;
      default:
        return <FiActivity className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Log Analysis
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Paste your system log below for instant AI-powered classification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FiFileText className="mr-2 text-blue-400" />
                  Input Log
                </h2>
                <span className="text-sm text-gray-400">
                  {log.length} characters
                </span>
              </div>

              <textarea
                className="w-full h-64 p-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition font-mono text-sm text-white placeholder-gray-400 resize-none"
                placeholder={`Paste your system log here...\nExample: 2024-01-15 10:30:45 ERROR: Database connection timeout`}
                value={log}
                onChange={(e) => setLog(e.target.value)}
                disabled={loading}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-900/30 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center">
                    <FiAlertCircle className="mr-2 flex-shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={analyzeLog}
                  disabled={loading || !log.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <FiCpu />
                      <span>Analyze Log</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  className="px-6 py-3 border-2 border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition font-semibold"
                >
                  Clear
                </button>
              </div>

              {/* Sample Logs */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">Sample Logs:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Database connection timeout",
                    "User authentication failed",
                    "Cache hit ratio: 95%",
                    "Disk space warning: 85% full"
                  ].map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setLog(sample)}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <FiActivity className="mr-2 text-blue-400" />
                    Analysis Result
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopyResult}
                      className="p-2 hover:bg-gray-700 rounded-lg transition relative"
                      title="Copy result"
                    >
                      <FiCopy className="text-gray-400" />
                      {copied && (
                        <span className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Copied!
                        </span>
                      )}
                    </button>
                    <button
                      className="p-2 hover:bg-gray-700 rounded-lg transition"
                      title="Download result"
                    >
                      <FiDownload className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Main Result Card */}
                <div className="bg-gray-700/30 rounded-xl p-6 mb-6 border border-gray-600">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-800 rounded-xl border border-gray-600">
                      {getCategoryIcon(result.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h3 className="text-2xl font-bold text-white">
                          {result.category || "Unknown"}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}% Confidence
                        </span>
                      </div>
                      <p className="text-gray-300">
                        {result.description || "Log analysis complete"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-white flex items-center">
                    <FiBarChart2 className="mr-2 text-blue-400" />
                    Detailed Analysis
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center text-gray-400 mb-1">
                        <FiFileText className="mr-2" size={14} />
                        <p className="text-sm">Log Length</p>
                      </div>
                      <p className="text-xl font-semibold text-white">{log.length} chars</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center text-gray-400 mb-1">
                        <FiTag className="mr-2" size={14} />
                        <p className="text-sm">Words</p>
                      </div>
                      <p className="text-xl font-semibold text-white">{log.split(/\s+/).length}</p>
                    </div>
                  </div>

                  {/* Keywords/Entities */}
                  {result.keywords && result.keywords.length > 0 && (
                    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                      <p className="text-sm text-gray-400 mb-2">Key Terms Found</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((keyword, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm border border-blue-500/30">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions && (
                    <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                      <p className="text-sm font-semibold text-purple-400 mb-2">Suggestions</p>
                      <p className="text-sm text-purple-300">{result.suggestions}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                    <p>Analyzed at: {new Date().toLocaleString()}</p>
                    <p>Model: BERT Ensemble</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-12 border border-gray-700 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-gray-600">
                  <FiUpload className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-400 max-w-md mb-6">
                  Paste your system log on the left and click "Analyze Log" to see AI-powered classification results
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  
                  
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <FiTrendingUp className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="font-semibold text-white mb-2">Multi-Model Analysis</h3>
            <p className="text-sm text-gray-400">Combines Regex, NLP, BERT for accurate classification</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <FiActivity className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-semibold text-white mb-2">Real-time Processing</h3>
            <p className="text-sm text-gray-400">Instant results with confidence scores and detailed explanations</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
            <FiFileText className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="font-semibold text-white mb-2">Multiple Formats</h3>
            <p className="text-sm text-gray-400">Support for various log formats and custom patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
}