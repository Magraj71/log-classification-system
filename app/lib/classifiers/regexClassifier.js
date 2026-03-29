/**
 * Regex-based Log Classifier
 * Uses pattern matching for common log formats (Apache, Nginx, Syslog, Stack Traces, JSON)
 * Returns category, confidence, matched patterns, and timing.
 */

const LOG_PATTERNS = {
  // === CRITICAL / FATAL Patterns ===
  critical: [
    { regex: /\b(FATAL|CRITICAL|EMERGENCY|PANIC)\b/i, weight: 0.95, name: "Fatal/Critical keyword" },
    { regex: /\b(out\s*of\s*memory|oom|heap\s*space|stack\s*overflow)\b/i, weight: 0.93, name: "Memory exhaustion" },
    { regex: /\b(segmentation\s*fault|segfault|core\s*dump|sigsegv|sigabrt)\b/i, weight: 0.95, name: "Segfault/Core dump" },
    { regex: /\b(kernel\s*panic|system\s*halt|unrecoverable)\b/i, weight: 0.94, name: "Kernel panic" },
    { regex: /\b(data\s*loss|data\s*corrupt|database\s*corrupt)\b/i, weight: 0.92, name: "Data loss/corruption" },
  ],

  // === ERROR Patterns ===
  error: [
    { regex: /\bERROR\b/, weight: 0.90, name: "ERROR keyword" },
    { regex: /\b(Exception|Error)\b:\s*.+/i, weight: 0.88, name: "Exception with message" },
    { regex: /\bTraceback\s*\(most\s*recent\s*call\s*last\)\s*:/i, weight: 0.92, name: "Python traceback" },
    { regex: /\bat\s+[\w.$]+\([\w.]+:\d+\)/m, weight: 0.88, name: "Java/JS stack trace" },
    { regex: /File\s+"[^"]+",\s+line\s+\d+/i, weight: 0.90, name: "Python file reference" },
    { regex: /\b(TypeError|ReferenceError|SyntaxError|RangeError|URIError)\b/i, weight: 0.91, name: "JavaScript error type" },
    { regex: /\b(NullPointerException|ClassNotFoundException|IOException|SQLException)\b/i, weight: 0.91, name: "Java exception type" },
    { regex: /\b(ConnectionRefused|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND)\b/i, weight: 0.89, name: "Connection error" },
    { regex: /HTTP\/[\d.]+["\s]+[5]\d{2}\b/, weight: 0.87, name: "HTTP 5xx status" },
    { regex: /\bstatus\s*(?:code)?\s*[:=]\s*5\d{2}\b/i, weight: 0.85, name: "HTTP 5xx in text" },
    { regex: /\b(failed|failure|abort|crashed|crash)\b/i, weight: 0.75, name: "Failure keywords" },
    { regex: /\b(denied|forbidden|unauthorized|authentication\s*failed)\b/i, weight: 0.82, name: "Auth failure" },
    { regex: /\b(CrashLoopBackOff|ImagePullBackOff|ErrImagePull|OOMKilled)\b/i, weight: 0.91, name: "Kubernetes error" },
    { regex: /\b(SIGTERM|SIGKILL|exit\s*code\s*[1-9])\b/i, weight: 0.84, name: "Process signal/exit code" },
    { regex: /\bpanic:\s*.+/i, weight: 0.90, name: "Go panic" },
    { regex: /^\s*at\s+.+\(.+:\d+:\d+\)/m, weight: 0.87, name: "Node.js stack frame" },
  ],

  // === WARNING Patterns ===
  warning: [
    { regex: /\b(WARN|WARNING)\b/i, weight: 0.88, name: "Warning keyword" },
    { regex: /\b(deprecated|deprecation)\b/i, weight: 0.80, name: "Deprecation notice" },
    { regex: /\b(slow\s*query|performance|latency|timeout)\b/i, weight: 0.75, name: "Performance warning" },
    { regex: /\b(retry|retrying|retries)\b/i, weight: 0.70, name: "Retry indicator" },
    { regex: /\b(disk\s*space|memory\s*usage|cpu\s*usage)\s*(low|high|warning|alert)/i, weight: 0.78, name: "Resource warning" },
    { regex: /HTTP\/[\d.]+["\s]+[4]\d{2}\b/, weight: 0.72, name: "HTTP 4xx status" },
    { regex: /\bstatus\s*(?:code)?\s*[:=]\s*4\d{2}\b/i, weight: 0.70, name: "HTTP 4xx in text" },
    { regex: /\b(certificate\s*expir|ssl\s*warning|tls\s*warning)\b/i, weight: 0.76, name: "TLS/SSL warning" },
  ],

  // === INFO Patterns ===
  info: [
    { regex: /\b(INFO|NOTICE|LOG)\b/i, weight: 0.85, name: "Info keyword" },
    { regex: /\b(start|started|starting|initialized|boot)\b/i, weight: 0.65, name: "Startup message" },
    { regex: /\b(success|successful|completed|done|ready|healthy)\b/i, weight: 0.70, name: "Success message" },
    { regex: /\b(connected|listening|serving|deployed|published)\b/i, weight: 0.68, name: "Connection/deployment" },
    { regex: /HTTP\/[\d.]+["\s]+[2]\d{2}\b/, weight: 0.75, name: "HTTP 2xx status" },
    { regex: /\bstatus\s*(?:code)?\s*[:=]\s*2\d{2}\b/i, weight: 0.70, name: "HTTP 2xx in text" },
  ],

  // === LOG FORMAT Detection ===
  formats: [
    { regex: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s+-\s+-\s+\[.+\]\s+"(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/, weight: 0, name: "Apache/Nginx access log" },
    { regex: /^<\d+>/, weight: 0, name: "Syslog format" },
    { regex: /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/, weight: 0, name: "ISO timestamp format" },
    { regex: /^\{.*"level"\s*:\s*"(error|warn|info|debug|fatal)".*\}$/is, weight: 0, name: "JSON structured log" },
  ]
};

/**
 * Classify a log message using regex patterns
 * @param {string} logText - The log message to classify
 * @returns {{ category: string, confidence: number, patternsMatched: string[], timeMs: number, method: string }}
 */
export function classifyWithRegex(logText) {
  const startTime = performance.now();

  if (!logText || typeof logText !== "string") {
    return {
      category: "INFO",
      confidence: 10,
      patternsMatched: [],
      timeMs: Math.round(performance.now() - startTime),
      method: "Regex"
    };
  }

  const matches = {
    CRITICAL: [],
    ERROR: [],
    WARNING: [],
    INFO: []
  };

  const scores = { CRITICAL: 0, ERROR: 0, WARNING: 0, INFO: 0 };
  const formatsDetected = [];

  // Check all patterns
  for (const [category, patterns] of Object.entries(LOG_PATTERNS)) {
    if (category === "formats") {
      for (const pattern of patterns) {
        if (pattern.regex.test(logText)) {
          formatsDetected.push(pattern.name);
        }
      }
      continue;
    }

    const catKey = category.toUpperCase() === "CRITICAL" ? "CRITICAL" : category.toUpperCase();
    for (const pattern of patterns) {
      if (pattern.regex.test(logText)) {
        matches[catKey]?.push(pattern.name);
        if (scores[catKey] !== undefined) {
          scores[catKey] = Math.max(scores[catKey], pattern.weight);
        }
      }
    }
  }

  // Merge CRITICAL into ERROR for final category (we use severity for the distinction)
  if (scores.CRITICAL > 0) {
    scores.ERROR = Math.max(scores.ERROR, scores.CRITICAL);
    matches.ERROR = [...matches.CRITICAL, ...matches.ERROR];
  }

  // Determine winning category
  let bestCategory = "INFO";
  let bestScore = scores.INFO || 0;

  for (const [cat, score] of Object.entries(scores)) {
    if (cat === "CRITICAL") continue; // Already merged
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  // Boost confidence if multiple patterns agree
  const matchCount = matches[bestCategory]?.length || 0;
  let confidence = Math.round(bestScore * 100);
  if (matchCount >= 3) confidence = Math.min(99, confidence + 5);
  else if (matchCount >= 2) confidence = Math.min(98, confidence + 3);

  // If nothing matched, it's likely INFO with low confidence
  if (confidence === 0) {
    bestCategory = "INFO";
    confidence = 30;
  }

  const allMatched = [
    ...matches[bestCategory] || [],
    ...formatsDetected
  ];

  const timeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    category: bestCategory,
    confidence,
    patternsMatched: [...new Set(allMatched)],
    timeMs,
    method: "Regex"
  };
}
