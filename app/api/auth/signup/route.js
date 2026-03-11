import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, email, password } = await req.json();

  const client = await clientPromise;
  const db = client.db("next_auth_db");

  const user = await db.collection("users").findOne({ email });

  if (user) {
    return Response.json({ error: "User exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    name,
    email,
    password: hashed,
    createdAt: new Date(),
  });

  return Response.json({
    success: true,
    user: { name, email },
  });
}