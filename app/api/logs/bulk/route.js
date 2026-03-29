import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { runEnsemble } from "../../../lib/classifiers/ensembleClassifier.js";
import { getUserId } from "../../../lib/utils/auth.js";

export async function POST(req) {
  try {
    const { logText, delimiter } = await req.json();

    if (!logText) {
      return NextResponse.json({ error: "No log text provided" }, { status: 400 });
    }

    const userId = getUserId(req) || "anonymous";

    // Split log file into individual entries
    // Try to detect multi-line logs by looking for timestamp patterns
    const lines = logText
      .split(/\n/)
      .filter(line => line.trim().length > 0);

    // Group lines that belong together (stack traces, multi-line logs)
    const logEntries = [];
    let currentEntry = "";

    for (const line of lines) {
      // Check if this line starts a new log entry (has timestamp or log level prefix)
      const isNewEntry = /^(\d{4}[-/]\d{2}[-/]\d{2}|(\[?\w{3}\s+\w{3}\s+\d+)|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\b(ERROR|WARN|INFO|DEBUG|FATAL|CRITICAL)\b|^[A-Z][a-z]+Error:)/.test(line.trim());

      if (isNewEntry && currentEntry) {
        logEntries.push(currentEntry.trim());
        currentEntry = line;
      } else {
        currentEntry += (currentEntry ? "\n" : "") + line;
      }
    }
    if (currentEntry.trim()) {
      logEntries.push(currentEntry.trim());
    }

    // If grouping didn't work well, fall back to line-by-line
    const entries = logEntries.length > 0 ? logEntries : lines;
    const maxEntries = Math.min(entries.length, 200); // Cap at 200

    // Process each entry
    const results = [];
    const summary = { ERROR: 0, WARNING: 0, INFO: 0, total: 0 };
    const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    let totalConfidence = 0;

    for (let i = 0; i < maxEntries; i++) {
      const entry = entries[i];
      if (!entry || entry.trim().length < 3) continue;

      const result = runEnsemble(entry, null);
      
      results.push({
        index: i + 1,
        logText: entry.length > 200 ? entry.substring(0, 200) + "..." : entry,
        fullText: entry,
        category: result.category,
        confidence: result.confidence,
        severity: result.severity,
        classifiers: result.classifiers
      });

      summary[result.category] = (summary[result.category] || 0) + 1;
      summary.total++;
      totalConfidence += result.confidence;

      if (result.severity?.level) {
        severityCounts[result.severity.level] = (severityCounts[result.severity.level] || 0) + 1;
      }
    }

    const avgConfidence = summary.total > 0 ? Math.round(totalConfidence / summary.total) : 0;

    // Save bulk results to DB
    try {
      const client = await clientPromise;
      const db = client.db("logSystem");

      // Save individual logs
      if (results.length > 0) {
        const docsToInsert = results.map(r => ({
          userId,
          logText: r.fullText,
          category: r.category,
          confidence: r.confidence,
          severity: r.severity,
          classifiers: r.classifiers,
          bulkProcessed: true,
          createdAt: new Date()
        }));
        await db.collection("logs").insertMany(docsToInsert);
      }
    } catch (dbError) {
      console.error("Failed to save bulk logs:", dbError);
    }

    return NextResponse.json({
      results,
      summary: {
        ...summary,
        avgConfidence,
        severityCounts
      },
      totalEntries: entries.length,
      processedEntries: maxEntries
    });

  } catch (error) {
    console.error("Bulk processing error:", error);
    return NextResponse.json({ error: "Bulk processing failed: " + error.message }, { status: 500 });
  }
}
