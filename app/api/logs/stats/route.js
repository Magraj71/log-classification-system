import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("logSystem");

    // Get date for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Trend Data (Line Chart)
    const trendPipeline = await db.collection("logs").aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
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
        name: isNaN(d) ? item._id : daysList[d.getDay()], // Fallback to raw string if date parsing fails
        Errors: item.errors,
        Warnings: item.warnings,
        Info: item.info
      };
    });

    // If no recent data, supply empty placeholder so chart still renders beautifully
    if (trendData.length === 0) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      days.forEach(day => trendData.push({ name: day, Errors: 0, Warnings: 0, Info: 0 }));
    }

    // 2. Category Distribution (Pie Chart)
    const categoryPipeline = await db.collection("logs").aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } }
    ]).toArray();

    let categoryData = categoryPipeline
      .filter(c => c._id) // filter out null categories
      .map(item => ({
        name: item._id,
        value: item.value
      }));

    if (categoryData.length === 0) {
      categoryData = [
        { name: "ERROR", value: 1 }, 
        { name: "WARNING", value: 0 }, 
        { name: "INFO", value: 0 }
      ];
    }

    return NextResponse.json({ trendData, categoryData });
  } catch (error) {
    console.error("Failed to fetch chart stats:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
