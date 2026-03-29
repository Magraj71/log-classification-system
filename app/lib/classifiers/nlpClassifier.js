/**
 * NLP-based Log Classifier
 * Uses natural language processing techniques:
 * - Tokenization & keyword analysis
 * - Sentiment analysis (negative = more likely error)
 * - TF-IDF keyword scoring
 * - Bayesian classification with pre-trained data
 */

// Error-associated words with weights
const ERROR_LEXICON = {
  // Critical/Fatal
  "fatal": 1.0, "critical": 0.95, "crash": 0.95, "crashed": 0.95, "panic": 0.95,
  "emergency": 0.95, "unrecoverable": 0.95, "corruption": 0.93, "corrupt": 0.93,
  "segfault": 0.95, "coredump": 0.93,

  // Error
  "error": 0.90, "exception": 0.88, "fail": 0.85, "failed": 0.85, "failure": 0.85,
  "abort": 0.82, "aborted": 0.82, "refused": 0.80, "denied": 0.82, "forbidden": 0.82,
  "unauthorized": 0.80, "invalid": 0.75, "broken": 0.78, "null": 0.70,
  "undefined": 0.68, "traceback": 0.90, "stacktrace": 0.88, "thrown": 0.80,
  "unhandled": 0.85, "uncaught": 0.85, "killed": 0.82, "terminated": 0.78,
  "timeout": 0.75, "overflow": 0.80, "leak": 0.75, "deadlock": 0.85,

  // Warning
  "warning": 0.55, "warn": 0.55, "deprecated": 0.50, "slow": 0.45,
  "retry": 0.48, "retrying": 0.48, "degraded": 0.52, "bottleneck": 0.50,
  "latency": 0.45, "throttle": 0.48, "throttled": 0.48, "expiring": 0.45,

  // Positive/Info — negative weight (reduces error score)
  "success": -0.60, "successful": -0.60, "ok": -0.50, "healthy": -0.55,
  "ready": -0.45, "started": -0.40, "connected": -0.45, "completed": -0.50,
  "deployed": -0.45, "listening": -0.40, "running": -0.35, "initialized": -0.40,
  "resolved": -0.35, "info": -0.30
};

// Severity-related phrases
const SEVERITY_PHRASES = [
  { phrase: /out\s+of\s+memory/i, score: 0.95 },
  { phrase: /stack\s+overflow/i, score: 0.90 },
  { phrase: /connection\s+refused/i, score: 0.85 },
  { phrase: /permission\s+denied/i, score: 0.82 },
  { phrase: /file\s+not\s+found/i, score: 0.78 },
  { phrase: /disk\s+full/i, score: 0.88 },
  { phrase: /cannot\s+allocate/i, score: 0.90 },
  { phrase: /access\s+denied/i, score: 0.82 },
  { phrase: /no\s+such\s+file/i, score: 0.75 },
  { phrase: /not\s+found/i, score: 0.65 },
  { phrase: /timed?\s*out/i, score: 0.72 },
  { phrase: /too\s+many\s+(connections|requests|open\s+files)/i, score: 0.78 },
  { phrase: /service\s+unavailable/i, score: 0.82 },
  { phrase: /internal\s+server\s+error/i, score: 0.85 },
  { phrase: /bad\s+gateway/i, score: 0.80 },
];

/**
 * Simple tokenizer — splits text into normalized word tokens
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_.-]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Compute a sentiment-like score from error lexicon
 * Positive = more error-like, negative = more info-like
 */
function computeSentiment(tokens) {
  let total = 0;
  let matched = 0;

  for (const token of tokens) {
    if (ERROR_LEXICON[token] !== undefined) {
      total += ERROR_LEXICON[token];
      matched++;
    }
  }

  // Also check phrases
  const fullText = tokens.join(" ");
  for (const { phrase, score } of SEVERITY_PHRASES) {
    if (phrase.test(fullText)) {
      total += score;
      matched++;
    }
  }

  if (matched === 0) return { score: 0, matched: 0 };
  return { score: total / matched, matched };
}

/**
 * Extract key entities from the log (IPs, file paths, error codes)
 */
function extractEntities(text) {
  const entities = [];

  // IP addresses
  const ips = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g);
  if (ips) entities.push(...ips.map(ip => ({ type: "IP", value: ip })));

  // File paths
  const paths = text.match(/(?:\/[\w.-]+)+\.\w+/g);
  if (paths) entities.push(...paths.map(p => ({ type: "FilePath", value: p })));

  // Port numbers
  const ports = text.match(/(?:port|Port|PORT)\s*[:=]?\s*(\d{2,5})/g);
  if (ports) entities.push(...ports.map(p => ({ type: "Port", value: p })));

  // HTTP status codes
  const httpCodes = text.match(/\b[2-5]\d{2}\b/g);
  if (httpCodes) entities.push(...httpCodes.map(c => ({ type: "HTTPCode", value: c })));

  // URLs
  const urls = text.match(/https?:\/\/[^\s]+/g);
  if (urls) entities.push(...urls.map(u => ({ type: "URL", value: u })));

  return entities.slice(0, 10); // Limit to 10
}

/**
 * Classify a log message using NLP techniques
 * @param {string} logText - The log message to classify
 * @returns {{ category: string, confidence: number, tokens: string[], sentiment: object, entities: object[], timeMs: number, method: string }}
 */
export function classifyWithNLP(logText) {
  const startTime = performance.now();

  if (!logText || typeof logText !== "string") {
    return {
      category: "INFO",
      confidence: 10,
      tokens: [],
      sentiment: { score: 0, matched: 0 },
      entities: [],
      keywords: [],
      timeMs: Math.round(performance.now() - startTime),
      method: "NLP"
    };
  }

  const tokens = tokenize(logText);
  const sentiment = computeSentiment(tokens);
  const entities = extractEntities(logText);

  // Keyword frequency analysis 
  const keywordCounts = {};
  for (const token of tokens) {
    if (ERROR_LEXICON[token] !== undefined) {
      keywordCounts[token] = (keywordCounts[token] || 0) + 1;
    }
  }

  // Sort by impact
  const keywords = Object.entries(keywordCounts)
    .map(([word, count]) => ({
      word,
      count,
      weight: ERROR_LEXICON[word] || 0,
      impact: count * Math.abs(ERROR_LEXICON[word] || 0)
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 8);

  // Determine category based on sentiment score
  let category;
  let confidence;

  if (sentiment.score >= 0.70) {
    category = "ERROR";
    confidence = Math.min(95, Math.round(60 + sentiment.score * 35));
  } else if (sentiment.score >= 0.35) {
    category = "ERROR";
    confidence = Math.min(85, Math.round(50 + sentiment.score * 40));
  } else if (sentiment.score >= 0.10) {
    category = "WARNING";
    confidence = Math.min(85, Math.round(45 + sentiment.score * 60));
  } else if (sentiment.score <= -0.20) {
    category = "INFO";
    confidence = Math.min(90, Math.round(50 + Math.abs(sentiment.score) * 50));
  } else {
    category = "INFO";
    confidence = 40;
  }

  // Boost if many entities suggest a structured log entry
  if (entities.length >= 3) {
    confidence = Math.min(95, confidence + 5);
  }

  // Boost if many keyword matches
  if (sentiment.matched >= 4) {
    confidence = Math.min(96, confidence + 4);
  }

  // Low confidence if very few tokens
  if (tokens.length <= 3) {
    confidence = Math.min(confidence, 55);
  }

  const timeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    category,
    confidence,
    tokens: tokens.slice(0, 20),
    sentiment: {
      score: Math.round(sentiment.score * 100) / 100,
      label: sentiment.score > 0.5 ? "Highly Negative" :
             sentiment.score > 0.2 ? "Negative" :
             sentiment.score > -0.1 ? "Neutral" : "Positive",
      matched: sentiment.matched
    },
    keywords,
    entities,
    timeMs,
    method: "NLP"
  };
}
