import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  const client = await clientPromise;
  const db = client.db("next_auth_db");

  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return Response.json({ error: "No user" }, { status: 400 });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return Response.json({ error: "Invalid creds" }, { status: 400 });
  }

  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET || "mysecret"
  );

  return Response.json({
  token,
  user: {
    name: user.name,
    email: user.email,
  },
});
}