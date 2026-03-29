import clientPromise from "../../lib/mongodb";
import { runEnsemble } from "../../lib/classifiers/ensembleClassifier.js";
import { getUserId } from "../../lib/utils/auth.js";

export async function POST(req) {
  try {
    const { log, userId: bodyUserId } = await req.json();

    if (!log || typeof log !== "string") {
      return Response.json({ error: "No log text provided" }, { status: 400 });
    }

    // Get user from JWT or body
    const userId = getUserId(req) || bodyUserId || "anonymous";

    // Run ensemble classifier (Regex + NLP, no Gemini for quick classify)
    const result = runEnsemble(log, null);

    const client = await clientPromise;
    const db = client.db("logSystem");

    const newLog = {
      userId,
      logText: log,
      category: result.category,
      confidence: result.confidence,
      severity: result.severity,
      classifiers: result.classifiers,
      createdAt: new Date()
    };

    await db.collection("logs").insertOne(newLog);

    return Response.json({
      category: result.category,
      confidence: result.confidence,
      severity: result.severity,
      classifiers: result.classifiers
    });
  } catch (error) {
    console.error("Classify error:", error);
    return Response.json({ error: "Classification failed" }, { status: 500 });
  }
}