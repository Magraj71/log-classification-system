"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiCode,
  FiTerminal,
  FiClock,
  FiActivity
} from "react-icons/fi";

export default function LogDetailsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [log, setLog] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  useEffect(() => {
    if (!id) return;
    
    setFetching(true);
    fetch(`/api/logs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setLog(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setFetching(false));
  }, [id]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Fetching Log Trace...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-16">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-200">
           <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Log Not Found</h2>
           <p className="text-slate-500 mb-6">{error || "The log analysis you are looking for does not exist."}</p>
           <button onClick={() => router.push("/dashboard")} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
             Return to Dashboard
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-emerald-600 font-bold transition mb-6 group">
            <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <span className={`px-3 py-1 text-xs font-bold rounded-md border uppercase tracking-widest ${
                    log.category === "ERROR" ? "bg-red-50 text-red-700 border-red-200" :
                    log.category === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                    "bg-emerald-50 text-emerald-700 border-emerald-200"
                 }`}>
                   {log.category || "UNKNOWN"}
                 </span>
                 <span className="flex items-center text-sm font-bold text-slate-500">
                   <FiActivity className="mr-1.5" /> {log.confidence || 0}% AI Confidence
                 </span>
                 <span className="flex items-center text-sm font-bold text-slate-500">
                   <FiClock className="mr-1.5" /> {new Date(log.createdAt).toLocaleString()}
                 </span>
               </div>
               <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                 {log.errorSummary || "Detailed Log Analysis"}
               </h1>
             </div>
             <div className="flex items-center gap-2">
               <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded font-mono text-xs font-bold">
                 ID: {log._id}
               </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: The Fix */}
          <div className="space-y-8 flex flex-col h-full">
            {/* Resolution Steps */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6">
                <FiCheckCircle className="mr-2.5 text-emerald-600" /> Resolution Steps
              </h2>
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                 <ul className="space-y-4">
                   {log.resolutionSteps?.map((step, idx) => (
                     <li key={idx} className="flex gap-4">
                       <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                         {idx + 1}
                       </span>
                       <span className="text-slate-800 font-medium leading-relaxed pt-1">
                         {step}
                       </span>
                     </li>
                   ))}
                   {(!log.resolutionSteps || log.resolutionSteps.length === 0) && (
                     <p className="text-slate-500">No resolution steps provided by AI.</p>
                   )}
                 </ul>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center mb-6">
                <FiFileText className="mr-2.5 text-blue-600" /> Root Cause Analysis
              </h2>
              <div className="bg-blue-50/30 p-5 rounded-xl border border-blue-50">
                 <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                   {log.rootCause}
                 </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Raw Log & Corrected Code */}
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex flex-col overflow-hidden h-full min-h-[600px]">
            
            {log.correctedCode && (
              <div className="flex-1 flex flex-col min-h-[50%] border-b border-slate-800">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center">
                    <FiCode className="mr-2" /> Corrected Code
                  </h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(log.correctedCode)}
                    className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-5 font-mono text-sm text-[#e2e8f0] overflow-y-auto flex-1 custom-scrollbar">
                  <code>{log.correctedCode}</code>
                </pre>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-[50%]">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <FiTerminal className="mr-2" /> Original Raw Log
                </h3>
              </div>
              <pre className="p-5 font-mono text-xs text-red-200/80 overflow-y-auto flex-1 custom-scrollbar break-words whitespace-pre-wrap">
                <code>{log.logText}</code>
              </pre>
            </div>

          </div>
        </div>
      </div>
      
      {/* Custom Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}
