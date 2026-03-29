import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { runEnsemble } from "../../../lib/classifiers/ensembleClassifier.js";
import { getUserId } from "../../../lib/utils/auth.js";

// ====== LLM Provider: Gemini ======
async function callGemini(logData, sourceCode, prompt) {
  if (!process.env.GEMINI_API_KEY) return null;
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ====== LLM Provider: Groq (Free — Llama 3) ======
async function callGroq(logData, sourceCode, prompt) {
  if (!process.env.GROQ_API_KEY) return null;
  
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 2048,
  });
  
  return chatCompletion.choices[0]?.message?.content || null;
}

// ====== Call LLM with provider fallback chain ======
async function callLLMWithFallback(logData, sourceCode) {
  const prompt = `
You are an expert software engineer and log analysis AI. 
Analyze the following error log. Give your output as a JSON object with the following keys and exact structure, without any markdown formatting around the json block:
{
  "errorSummary": "A brief one-sentence summary of what the error is.",
  "rootCause": "A detailed explanation of why this error occurred based on the log.",
  "resolutionSteps": [
    "Step 1 to fix the error",
    "Step 2 to fix the error",
    "etc."
  ],
  "category": "ERROR, WARNING, or INFO",
  "confidence": 95,
  "correctedCode": "The full corrected source code snippet here if applicable, or null if no code provided or no fix needed."
}

Here is the log:
${logData}

Here is the related source code (if any):
${sourceCode || "None provided."}
`;

  // Try providers in order: Gemini → Groq
  const providers = [
    { name: "Gemini", fn: () => callGemini(logData, sourceCode, prompt) },
    { name: "Groq", fn: () => callGroq(logData, sourceCode, prompt) },
  ];

  for (const provider of providers) {
    try {
      const startTime = performance.now();
      const text = await provider.fn();
      
      if (!text) continue; // No API key for this provider, skip
      
      const timeMs = Math.round(performance.now() - startTime);
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const parsed = JSON.parse(cleanText);
        parsed.timeMs = timeMs;
        parsed.provider = provider.name;
        console.log(`✓ LLM response from ${provider.name} in ${timeMs}ms`);
        return { analysis: parsed, status: "success", provider: provider.name, timeMs };
      } catch (parseError) {
        console.warn(`${provider.name} response not valid JSON, trying next...`);
        continue;
      }
    } catch (error) {
      const isQuota = error.message?.includes("429") || error.message?.includes("quota");
      console.warn(`${provider.name} ${isQuota ? "quota_exceeded" : "error"}: ${error.message?.substring(0, 80)}`);
      continue; // Try next provider
    }
  }

  // All providers failed
  return { analysis: null, status: "all_failed", provider: "none", timeMs: 0 };
}

// ====== Fallback code fixer (when all LLMs unavailable) ======
function generateFallbackAnalysis(logData, sourceCode, ensembleResult) {
  const patterns = ensembleResult.analysis.regexPatterns || [];
  const keywords = ensembleResult.analysis.nlpKeywords || [];

  // Smart error summary from detected patterns
  let errorSummary = "";
  if (patterns.length > 0) {
    errorSummary = `Detected: ${patterns.slice(0, 3).join(", ")}`;
  } else if (keywords.length > 0) {
    errorSummary = `${ensembleResult.category} detected — key indicators: ${keywords.slice(0, 3).map(k => k.word).join(", ")}`;
  } else {
    errorSummary = `${ensembleResult.category} level log with ${ensembleResult.confidence}% confidence`;
  }

  // Root cause from patterns
  const rootParts = [];
  if (patterns.includes("Python traceback")) rootParts.push("A Python exception was raised during execution");
  if (patterns.includes("Java/JS stack trace") || patterns.includes("Node.js stack frame")) rootParts.push("An unhandled exception propagated through the call stack");
  if (patterns.includes("Connection error") || patterns.includes("HTTP 5xx status")) rootParts.push("A network/service connectivity issue was detected");
  if (patterns.includes("Auth failure")) rootParts.push("An authentication or authorization check failed");
  if (patterns.includes("Memory exhaustion")) rootParts.push("The process ran out of available memory");
  if (patterns.includes("Kubernetes error")) rootParts.push("A Kubernetes pod/container lifecycle issue was detected");
  if (patterns.includes("Failure keywords")) rootParts.push("The operation did not complete successfully");
  if (keywords.some(k => k.word === "timeout")) rootParts.push("A timeout occurred");
  if (keywords.some(k => k.word === "undefined" || k.word === "null")) rootParts.push("A null/undefined reference was accessed");
  if (keywords.some(k => k.word === "denied" || k.word === "forbidden")) rootParts.push("Access was denied due to insufficient permissions");

  const rootCause = rootParts.length > 0 
    ? rootParts.join(". ") + "."
    : `Analysis based on ${patterns.length} pattern matches and NLP sentiment analysis.`;

  // Resolution steps
  const steps = [];
  if (ensembleResult.category === "ERROR") {
    steps.push("Check the stack trace to identify the exact error location");
    if (keywords.some(k => k.word === "refused" || k.word === "timeout")) {
      steps.push("Verify the target service/database is running and accessible");
      steps.push("Check firewall rules, DNS resolution, and network connectivity");
    }
    if (keywords.some(k => k.word === "null" || k.word === "undefined")) {
      steps.push("Add null checks before accessing properties on objects that may not exist");
      steps.push("Use optional chaining (?.) or default values to handle missing data");
    }
    if (keywords.some(k => k.word === "denied" || k.word === "unauthorized")) {
      steps.push("Verify credentials, API keys, and tokens are valid and not expired");
    }
    if (patterns.includes("Memory exhaustion")) {
      steps.push("Increase memory allocation and profile for memory leaks");
    }
    steps.push("Add error handling (try/catch) and logging at the failure point");
  } else if (ensembleResult.category === "WARNING") {
    steps.push("Monitor warning frequency — investigate if it increases");
    if (keywords.some(k => k.word === "deprecated")) steps.push("Update the deprecated API/library");
    if (keywords.some(k => k.word === "slow")) steps.push("Profile and optimize the slow operation");
    steps.push("Set up alerting for repeated warnings");
  } else {
    steps.push("This is informational — no immediate action required");
    steps.push("Ensure logging levels are appropriately configured");
  }

  // Auto-fix code
  let correctedCode = null;
  if (sourceCode && sourceCode.trim().length > 0) {
    correctedCode = autoFixCode(sourceCode, logData, patterns, keywords);
  }

  return { errorSummary, rootCause, resolutionSteps: steps.slice(0, 6), correctedCode };
}

// ====== Auto code fixer ======
function autoFixCode(sourceCode, logData, patterns, keywords) {
  let fixed = sourceCode;
  let fixes = [];

  // Fix: Add optional chaining for undefined/null errors
  if (logData.match(/Cannot read propert(y|ies) of (undefined|null)/i) || keywords.some(k => k.word === "undefined" || k.word === "null")) {
    fixed = fixed.replace(
      /(\w+)\.(\w+)\.(\w+)/g,
      (match, obj, p1, p2) => {
        if (['const', 'let', 'var', 'function', 'class', 'import', 'export', 'return', 'console', 'require', 'module', 'this'].includes(obj)) return match;
        fixes.push(`Added optional chaining for ${obj}.${p1}.${p2}`);
        return `${obj}?.${p1}?.${p2}`;
      }
    );
  }

  // Fix: Python KeyError → .get()
  if (logData.includes("KeyError") && sourceCode.includes("['")) {
    fixed = fixed.replace(/(\w+)\['(\w+)'\]/g, (m, obj, key) => {
      fixes.push(`Changed ${obj}['${key}'] to ${obj}.get('${key}', None)`);
      return `${obj}.get('${key}', None)`;
    });
  }

  // Fix: NullPointerException hint
  if (logData.includes("NullPointerException")) {
    fixes.push("Add null check: if (object != null) before accessing methods");
  }

  // Fix: Module not found hint
  if (logData.includes("Module not found") || logData.includes("Can't resolve")) {
    fixes.push("Check and fix the import path — file may have been moved or renamed");
  }

  if (fixes.length > 0) {
    return `// ===== AUTO-CORRECTED CODE =====\n// Fixes applied:\n${fixes.map((f, i) => `//   ${i + 1}. ${f}`).join("\n")}\n// ================================\n\n${fixed}`;
  }

  return `// ===== SUGGESTED CORRECTIONS =====\n// Detected patterns: ${patterns.slice(0, 3).join(", ") || "none"}\n// Add error handling around the failing code\n// =================================\n\n${sourceCode}`;
}

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    
    const { logData, sourceCode } = body;
    if (!logData) {
      return NextResponse.json({ error: "No log data provided" }, { status: 400 });
    }

    const userId = getUserId(req);

    // ====== STEP 1: Run Regex + NLP (fast) ======
    const ensembleWithoutLLM = runEnsemble(logData, null);

    // ====== STEP 2: Call LLM (Gemini → Groq → Fallback) ======
    const llmResult = await callLLMWithFallback(logData, sourceCode);
    const llmAnalysis = llmResult.analysis;

    // ====== STEP 3: Run ensemble with LLM result ======
    const llmForEnsemble = llmAnalysis ? {
      category: llmAnalysis.category,
      confidence: llmAnalysis.confidence,
      timeMs: llmResult.timeMs
    } : null;

    const ensembleResult = runEnsemble(logData, llmForEnsemble);

    // Update the Gemini classifier label to show actual provider used
    if (llmResult.provider !== "none" && ensembleResult.classifiers) {
      const geminiEntry = ensembleResult.classifiers.find(c => c.method === "Gemini");
      if (geminiEntry) {
        geminiEntry.method = llmResult.provider;
        geminiEntry.icon = llmResult.provider === "Groq" ? "🚀" : "🤖";
      }
    }

    // ====== STEP 4: Build response ======
    const fallback = (!llmAnalysis) ? generateFallbackAnalysis(logData, sourceCode, ensembleResult) : null;

    const finalResult = {
      errorSummary: llmAnalysis?.errorSummary || fallback?.errorSummary || `${ensembleResult.category} detected`,
      rootCause: llmAnalysis?.rootCause || fallback?.rootCause || "Unable to determine root cause.",
      resolutionSteps: llmAnalysis?.resolutionSteps || fallback?.resolutionSteps || ["Review the error log"],
      correctedCode: llmAnalysis?.correctedCode || fallback?.correctedCode || null,

      category: ensembleResult.category,
      confidence: ensembleResult.confidence,
      severity: ensembleResult.severity,
      classifiers: ensembleResult.classifiers,

      analysis: {
        ...ensembleResult.analysis,
        llmProvider: llmResult.provider,
        llmStatus: llmResult.status
      }
    };

    // ====== STEP 5: Save to Database ======
    try {
      const client = await clientPromise;
      const db = client.db("logSystem");
      await db.collection("logs").insertOne({
        userId: userId || "anonymous",
        logText: logData,
        sourceCode: sourceCode || null,
        errorSummary: finalResult.errorSummary,
        rootCause: finalResult.rootCause,
        resolutionSteps: finalResult.resolutionSteps,
        correctedCode: finalResult.correctedCode,
        category: finalResult.category,
        confidence: finalResult.confidence,
        severity: finalResult.severity,
        classifiers: finalResult.classifiers,
        analysisMetadata: finalResult.analysis,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error("Failed to save log to DB:", dbError);
    }

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error("Error analyzing log:", error);
    return NextResponse.json({ error: "Failed to analyze log: " + error.message }, { status: 500 });
  }
}
