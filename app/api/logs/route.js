import clientPromise from "../../lib/mongodb";
import { getUserId } from "../../lib/utils/auth.js";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("logSystem");

    // Try to scope by user, fall back to all logs
    const userId = getUserId(req);
    const filter = userId ? { userId } : {};

    // Get recent logs
    const logs = await db
      .collection("logs")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Aggregate stats (scoped to user if authenticated)
    const totalLogs = await db.collection("logs").countDocuments(filter);
    const errors = await db.collection("logs").countDocuments({ ...filter, category: "ERROR" });
    const warnings = await db.collection("logs").countDocuments({ ...filter, category: "WARNING" });
    
    // Calculate average confidence
    const confPipeline = await db.collection("logs").aggregate([
      { $match: { ...filter, confidence: { $exists: true, $type: "number" } } },
      { $group: { _id: null, avgConf: { $avg: "$confidence" } } }
    ]).toArray();
    
    const accuracy = confPipeline.length > 0 && confPipeline[0].avgConf 
      ? Math.round(confPipeline[0].avgConf) 
      : 0;

    // Severity distribution
    const severityPipeline = await db.collection("logs").aggregate([
      { $match: { ...filter, "severity.level": { $exists: true } } },
      { $group: { _id: "$severity.level", count: { $sum: 1 } } }
    ]).toArray();

    const severityDistribution = {};
    for (const item of severityPipeline) {
      if (item._id) severityDistribution[item._id] = item.count;
    }

    const stats = {
      totalLogs,
      processed: totalLogs,
      errors,
      warnings,
      info: totalLogs - errors - warnings,
      accuracy: accuracy > 0 ? accuracy : 0,
      severityDistribution
    };

    return Response.json({ logs, stats });
  } catch (error) {
    console.error("Failed to fetch logs and stats from DB:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}