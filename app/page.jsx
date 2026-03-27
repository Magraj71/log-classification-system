export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-10">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Intelligent Log
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Classification System</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Harness the power of LLM, NLP, and Regex to automatically classify and analyze your system logs with unprecedented accuracy.
          </p>
        </div>

        {/* Project Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-emerald-100/50">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">LLM Engine</h3>
            <p className="text-slate-600 leading-relaxed">Advanced LLM-based classification for complex log patterns and anomaly detection</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-teal-100/50">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold  text-slate-800 mb-2">NLP Processing</h3>
            <p className="text-slate-600 leading-relaxed">Natural language understanding for context-aware log analysis using compromise.js</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-emerald-100/50">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Pattern Matching</h3>
            <p className="text-slate-600 leading-relaxed">Lightning-fast pattern recognition for known error signatures and log formats</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-teal-100 hover:border-teal-300 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-teal-100/50">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">BERT Architecture</h3>
            <p className="text-slate-600 leading-relaxed">Transformer-based deep learning for semantic understanding of log messages</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-md shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center relative z-10">Why Choose LogClassify AI?</h2>
          
          <div className="grid md:grid-cols-2 gap-10 relative z-10">
            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-emerald-700 text-lg font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Multi-Model Classification</h3>
                <p className="text-slate-600 leading-relaxed">Combines Regex, NLP, BERT for comprehensive log analysis with fallback mechanisms to ensure accuracy.</p>
              </div>
            </div>

            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-emerald-700 text-lg font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">File Upload Support</h3>
                <p className="text-slate-600 leading-relaxed">Upload multiple log formats (.log, .txt, .csv) with a seamless, drag-and-drop interface.</p>
              </div>
            </div>

            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-emerald-700 text-lg font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Real-time Analysis</h3>
                <p className="text-slate-600 leading-relaxed">Instant classification results with confidence scores and detailed, actionable explanations.</p>
              </div>
            </div>

            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-emerald-700 text-lg font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Secure & Private</h3>
                <p className="text-slate-600 leading-relaxed">JWT authentication and encrypted data storage for enterprise-grade security you can trust.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 mb-10">
          <button className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-xl shadow-emerald-600/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/30">
            Get Started For Free
          </button>
          <p className="text-slate-500 mt-5 font-medium">No credit card required • 14-day free trial</p>
        </div>
      </main>
    </div>
  );
}