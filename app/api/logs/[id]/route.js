import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Log ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("logSystem");

    const log = await db.collection("logs").findOne({ _id: new ObjectId(id) });
    
    if (!log) {
      return NextResponse.json({ error: "Log not found in database" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Failed to fetch specific log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
