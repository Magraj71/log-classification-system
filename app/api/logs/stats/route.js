import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getUserId } from "../../../lib/utils/auth.js";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("logSystem");

    const userId = getUserId(req);
    const filter = userId ? { userId } : {};

    // Get date for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Trend Data (Line Chart)
    const trendPipeline = await db.collection("logs").aggregate([
      { $match: { ...filter, createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          errors: { $sum: { $cond: [{ $eq: ["$category", "ERROR"] }, 1, 0] } },
          warnings: { $sum: { $cond: [{ $eq: ["$category", "WARNING"] }, 1, 0] } },
          info: { $sum: { $cond: [{ $eq: ["$category", "INFO"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const daysList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const trendData = trendPipeline.map(item => {
      const d = new Date(item._id);
      return {
        name: isNaN(d) ? item._id : daysList[d.getDay()],
        Errors: item.errors,
        Warnings: item.warnings,
        Info: item.info
      };
    });

    if (trendData.length === 0) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      days.forEach(day => trendData.push({ name: day, Errors: 0, Warnings: 0, Info: 0 }));
    }

    // 2. Category Distribution (Pie Chart)
    const categoryPipeline = await db.collection("logs").aggregate([
      { $match: filter },
      { $group: { _id: "$category", value: { $sum: 1 } } }
    ]).toArray();

    let categoryData = categoryPipeline
      .filter(c => c._id)
      .map(item => ({
        name: item._id,
        value: item.value
      }));

    if (categoryData.length === 0) {
      categoryData = [
        { name: "ERROR", value: 0 }, 
        { name: "WARNING", value: 0 }, 
        { name: "INFO", value: 0 }
      ];
    }

    // 3. Severity Distribution (Donut Chart)
    const severityPipeline = await db.collection("logs").aggregate([
      { $match: { ...filter, "severity.level": { $exists: true } } },
      { $group: { _id: "$severity.level", value: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    const severityOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
    let severityData = severityPipeline
      .filter(s => s._id)
      .map(item => ({ name: item._id, value: item.value }))
      .sort((a, b) => (severityOrder[a.name] ?? 99) - (severityOrder[b.name] ?? 99));

    if (severityData.length === 0) {
      severityData = [
        { name: "Critical", value: 0 },
        { name: "High", value: 0 },
        { name: "Medium", value: 0 },
        { name: "Low", value: 0 }
      ];
    }

    // 4. Top Error Patterns (Bar Chart)
    const patternPipeline = await db.collection("logs").aggregate([
      { $match: { ...filter, errorSummary: { $exists: true, $ne: null } } },
      { $group: { _id: "$errorSummary", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const topPatterns = patternPipeline.map(item => ({
      name: item._id?.length > 40 ? item._id.substring(0, 40) + "..." : item._id,
      count: item.count
    }));

    return NextResponse.json({ trendData, categoryData, severityData, topPatterns });
  } catch (error) {
    console.error("Failed to fetch chart stats:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
