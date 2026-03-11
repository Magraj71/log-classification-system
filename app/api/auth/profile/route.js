import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req) {

  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return Response.json({ error: "No token" }, { status: 401 });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await clientPromise;
    const db = client.db("next_auth_db");

    const user = await db.collection("users").findOne({
      email: decoded.email
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      email: user.email,
      name: user.name || "",
      bio: user.bio || "",
      image: user.image || ""
    });

  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req) {

  try {

    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "No token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();
    const { name, bio, image } = body;

    const client = await clientPromise;
    const db = client.db("next_auth_db");

    await db.collection("users").updateOne(
      { email: decoded.email },
      {
        $set: { name, bio, image }
      }
    );

    return Response.json({ success: true });

  } catch (err) {

    console.log(err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );

  }

}