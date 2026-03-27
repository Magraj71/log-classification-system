import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise;
    const db = client.db("next_auth_db");
    
    const user = await db.collection("users").findOne({ email: decoded.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json({ keys: user.apiKeys || [] });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await clientPromise;
    const db = client.db("next_auth_db");
    
    const newKey = {
      id: Date.now().toString(),
      name: "Generated API Key",
      key: `sk_log_${crypto.randomBytes(12).toString('hex')}`,
      createdAt: new Date().toLocaleDateString(),
      lastUsed: "Never"
    };

    await db.collection("users").updateOne(
      { email: decoded.email },
      { $push: { apiKeys: newKey } }
    );
    
    return NextResponse.json(newKey);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing Key ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("next_auth_db");
    
    await db.collection("users").updateOne(
      { email: decoded.email },
      { $pull: { apiKeys: { id } } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }
}
