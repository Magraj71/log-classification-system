/**
 * Severity Scoring System
 * Scores logs on a 1-10 scale with level labels and colors.
 */

const SEVERITY_KEYWORDS = {
  // +3 Critical
  critical_plus3: [
    /\b(crash|crashed|core\s*dump|segfault|panic|fatal|data\s*loss|corrupt|unrecoverable)\b/i,
    /\b(oom|out\s*of\s*memory|heap\s*space|stack\s*overflow)\b/i,
    /\b(kernel\s*panic|system\s*halt)\b/i,
  ],
  // +2 Severe
  severe_plus2: [
    /\b(timeout|timed\s*out|connection\s*refused|ECONNREFUSED|ETIMEDOUT)\b/i,
    /\b(service\s*unavailable|502|503|504)\b/i,
    /\b(deadlock|memory\s*leak|denied|unauthorized|forbidden)\b/i,
    /\b(CrashLoopBackOff|OOMKilled|SIGKILL)\b/i,
  ],
  // +1 Moderate
  moderate_plus1: [
    /\b(deprecated|slow\s*query|retry|retrying|high\s*latency)\b/i,
    /\b(disk\s*space|throttle|bottleneck|degraded)\b/i,
    /\b(certificate\s*expir|ssl\s*error)\b/i,
    /\b(404|401|403|400)\b/,
  ]
};

/**
 * Score a log's severity on a 1-10 scale
 * @param {string} logText - Raw log text
 * @param {string} category - Already determined category (ERROR/WARNING/INFO)
 * @returns {{ score: number, level: string, color: string, emoji: string }}
 */
export function scoreSeverity(logText, category = "INFO") {
  // Base score from category
  let score;
  switch (category) {
    case "ERROR": score = 7; break;
    case "WARNING": score = 4; break;
    case "INFO": 
    default: score = 1; break;
  }

  if (!logText) {
    return formatResult(score);
  }

  // Apply keyword bonuses
  for (const pattern of SEVERITY_KEYWORDS.critical_plus3) {
    if (pattern.test(logText)) {
      score += 3;
      break; // Only apply highest bonus once per tier
    }
  }

  for (const pattern of SEVERITY_KEYWORDS.severe_plus2) {
    if (pattern.test(logText)) {
      score += 2;
      break;
    }
  }

  for (const pattern of SEVERITY_KEYWORDS.moderate_plus1) {
    if (pattern.test(logText)) {
      score += 1;
      break;
    }
  }

  // Check stack trace depth — deeper = more severe
  const stackFrames = (logText.match(/^\s*at\s+/gm) || []).length;
  if (stackFrames > 10) score += 2;
  else if (stackFrames > 5) score += 1;

  // Check for multiple error indicators — compounds severity
  const errorKeywordCount = (logText.match(/\b(error|exception|fail|crash|fatal)\b/gi) || []).length;
  if (errorKeywordCount >= 4) score += 1;

  // Cap at 10
  score = Math.min(10, Math.max(1, score));

  return formatResult(score);
}

function formatResult(score) {
  if (score >= 9) {
    return { score, level: "Critical", color: "#dc2626", emoji: "🔴", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" };
  } else if (score >= 7) {
    return { score, level: "High", color: "#ea580c", emoji: "🟠", bgColor: "bg-orange-50", textColor: "text-orange-700", borderColor: "border-orange-200" };
  } else if (score >= 4) {
    return { score, level: "Medium", color: "#ca8a04", emoji: "🟡", bgColor: "bg-yellow-50", textColor: "text-yellow-700", borderColor: "border-yellow-200" };
  } else {
    return { score, level: "Low", color: "#16a34a", emoji: "🟢", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200" };
  }
}
