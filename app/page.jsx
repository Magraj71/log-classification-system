"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiArrowRight, FiSearch, FiZap } from "react-icons/fi";

// Animated counter hook
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

// Scroll-triggered fade-in component
function FadeInOnScroll({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  // Typing animation
  const words = ["Classification", "Analysis", "Monitoring", "Intelligence"];
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const currentWord = words[wordIndex];
    const speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentWord.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setDisplayText(currentWord.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((wordIndex + 1) % words.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

  // Quick demo
  const [demoLog, setDemoLog] = useState("");
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleQuickDemo = async () => {
    if (!demoLog.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: demoLog })
      });
      const data = await res.json();
      setDemoResult(data);
    } catch (e) {
      setDemoResult({ category: "ERROR", confidence: 0, error: e.message });
    } finally {
      setDemoLoading(false);
    }
  };

  const counter1 = useCountUp(10000, 2500);
  const counter2 = useCountUp(99, 2000);
  const counter3 = useCountUp(3, 1500);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-16">
        
        {/* Hero Section */}
        <div className="text-center mb-20 pt-10">
          <FadeInOnScroll>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Intelligent Log
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {displayText}
              </span>
              <span className="animate-blink text-emerald-600">|</span>
            </h1>
          </FadeInOnScroll>
          
          <FadeInOnScroll delay={200}>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Harness the power of <strong>multi-model AI</strong> — Regex, NLP, and Gemini LLM — to automatically classify and analyze your system logs with unprecedented accuracy.
            </p>
          </FadeInOnScroll>

          <FadeInOnScroll delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-xl shadow-emerald-600/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 flex items-center gap-2"
              >
                Get Started For Free
                <FiArrowRight />
              </Link>
              <Link
                href="/upload"
                className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-700 text-lg rounded-xl font-bold transition-all border border-slate-200 hover:border-emerald-300 shadow-sm flex items-center gap-2"
              >
                <FiSearch className="text-emerald-600" />
                Try Analyzer
              </Link>
            </div>
            <p className="text-slate-500 mt-5 font-medium">No credit card required • Instant access</p>
          </FadeInOnScroll>
        </div>

        {/* Stats Counter Section */}
        <FadeInOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-3xl mx-auto">
            <div ref={counter1.ref} className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-4xl font-extrabold text-emerald-600">{counter1.count.toLocaleString()}+</p>
              <p className="text-slate-600 font-bold mt-1">Logs Analyzed</p>
            </div>
            <div ref={counter2.ref} className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-4xl font-extrabold text-emerald-600">{counter2.count}%</p>
              <p className="text-slate-600 font-bold mt-1">Classification Accuracy</p>
            </div>
            <div ref={counter3.ref} className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-4xl font-extrabold text-emerald-600">{counter3.count}</p>
              <p className="text-slate-600 font-bold mt-1">AI Models Combined</p>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Project Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
          <FadeInOnScroll delay={0}>
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-emerald-100/50">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">🤖 LLM Engine</h3>
              <p className="text-slate-600 leading-relaxed">Advanced Gemini AI for deep log understanding, root cause analysis, and code fix suggestions</p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={100}>
            <div className="bg-white p-6 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-teal-100/50">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">📝 NLP Processing</h3>
              <p className="text-slate-600 leading-relaxed">Sentiment analysis, keyword extraction, and entity recognition for context-aware classification</p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={200}>
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-emerald-100/50">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">🔍 Pattern Matching</h3>
              <p className="text-slate-600 leading-relaxed">40+ regex patterns for Apache, Nginx, Syslog, Stack Traces, K8s, and JSON log formats</p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={300}>
            <div className="bg-white p-6 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-teal-100/50">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">⚡ Ensemble Voting</h3>
              <p className="text-slate-600 leading-relaxed">Weighted multi-model voting system combines results from all classifiers for maximum accuracy</p>
            </div>
          </FadeInOnScroll>
        </div>

        {/* Quick Demo Widget */}
        <FadeInOnScroll>
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden mb-20 max-w-3xl mx-auto">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 text-center relative z-10 flex items-center justify-center gap-2">
              <FiZap className="text-emerald-600" /> Quick Demo
            </h2>
            <p className="text-slate-500 text-center mb-6 font-medium">Try the classifier instantly — no login required</p>

            <div className="relative z-10">
              <textarea
                className="w-full p-4 border border-slate-200 rounded-xl font-mono text-sm text-slate-800 resize-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50"
                rows={3}
                placeholder='Paste a log line, e.g.: ERROR: Connection refused to database at 10.0.1.45:5432'
                value={demoLog}
                onChange={(e) => setDemoLog(e.target.value)}
              />
              <button
                onClick={handleQuickDemo}
                disabled={demoLoading || !demoLog.trim()}
                className="mt-3 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {demoLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Classifying...
                  </>
                ) : (
                  <>
                    <FiSearch /> Classify Now
                  </>
                )}
              </button>

              {demoResult && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex px-3 py-1.5 text-sm font-bold uppercase rounded-lg border ${
                      demoResult.category === "ERROR" ? "bg-red-50 text-red-700 border-red-200" :
                      demoResult.category === "WARNING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {demoResult.severity?.emoji} {demoResult.category}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{demoResult.confidence}% confidence</span>
                  </div>

                  {/* Mini comparison table */}
                  {demoResult.classifiers && (
                    <div className="space-y-1.5">
                      {demoResult.classifiers.map((clf, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-700">{clf.icon} {clf.method}</span>
                          <span className={`font-bold ${
                            clf.category === "ERROR" ? "text-red-600" : clf.category === "WARNING" ? "text-yellow-600" : "text-emerald-600"
                          }`}>{clf.category}</span>
                          <span className="font-bold text-slate-500">{clf.confidence}%</span>
                          <span className="font-mono text-slate-400">{clf.timeMs < 1 ? "<1ms" : `${clf.timeMs}ms`}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link href="/upload" className="mt-3 block text-center text-sm font-bold text-emerald-600 hover:text-emerald-700 transition">
                    Want full AI analysis with code fixes? →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Features Section */}
        <FadeInOnScroll>
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden mb-16">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center relative z-10">Why Choose LogClassify AI?</h2>
            
            <div className="grid md:grid-cols-2 gap-10 relative z-10">
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-emerald-700 text-lg font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Multi-Model Ensemble</h3>
                  <p className="text-slate-600 leading-relaxed">Combines Regex, NLP, and LLM classifiers with weighted voting. See how each model performs with our comparison table.</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-emerald-700 text-lg font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Bulk Log Processing</h3>
                  <p className="text-slate-600 leading-relaxed">Upload entire log files with hundreds of entries. Get instant classification with summary reports and CSV/PDF export.</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-emerald-700 text-lg font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">AI Code Fixing</h3>
                  <p className="text-slate-600 leading-relaxed">Paste your error log + source code and get corrected code suggestions with side-by-side diff views.</p>
                </div>
              </div>

              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-emerald-700 text-lg font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Severity Scoring</h3>
                  <p className="text-slate-600 leading-relaxed">Each log gets a 1-10 severity score with Critical/High/Medium/Low levels. Prioritize the fires that matter most.</p>
                </div>
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        {/* CTA */}
        <FadeInOnScroll>
          <div className="text-center mt-20 mb-10">
            <Link
              href="/signup"
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-xl shadow-emerald-600/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 inline-flex items-center gap-2"
            >
              Start Analyzing Logs
              <FiArrowRight />
            </Link>
            <p className="text-slate-500 mt-5 font-medium">Free forever • No setup required</p>
          </div>
        </FadeInOnScroll>
      </main>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 1s step-end infinite; }
        @keyframes animate-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: animate-in 0.4s ease-out; }
      `}} />
    </div>
  );
}