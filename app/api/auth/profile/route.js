import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return Response.json({ success: false, error: "No authentication token found." }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await clientPromise;
    const db = client.db("next_auth_db");

    const user = await db.collection("users").findOne({
      email: decoded.email
    });

    if (!user) {
      return Response.json({ success: false, error: "User profile not found." }, { status: 404 });
    }

    return Response.json({
      success: true,
      email: user.email,
      name: user.name || "",
      bio: user.bio || "",
      image: user.image || ""
    });

  } catch (error) {
    return Response.json({ success: false, error: "Invalid or expired token." }, { status: 401 });
  }
}

export async function PUT(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ success: false, error: "No authentication token found." }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await req.json();
    let { name, bio, image } = body;

    // Security Validations
    if (name && name.length > 100) {
      return Response.json({ success: false, error: "Name must be less than 100 characters." }, { status: 400 });
    }
    
    if (bio && bio.length > 500) {
       return Response.json({ success: false, error: "Bio must be less than 500 characters." }, { status: 400 });
    }

    // Protection against massive uncompressed Base64 payloads attacking the MongoDB 16MB document limit
    if (image && typeof image === 'string') {
        // ~2MB limit for base64 strings is generous enough for a 400x400 heavily compressed profile picture
        if (image.length > 2 * 1024 * 1024) {
            return Response.json({ success: false, error: "Image file is too large. Please upload an image smaller than 2MB." }, { status: 413 });
        }
    }

    const client = await clientPromise;
    const db = client.db("next_auth_db");

    const result = await db.collection("users").updateOne(
      { email: decoded.email },
      {
        $set: { 
            name: name?.trim(), 
            bio: bio?.trim(), 
            image: image 
        }
      }
    );

    if (result.matchedCount === 0) {
       return Response.json({ success: false, error: "User account not found to update." }, { status: 404 });
    }

    return Response.json({ success: true, message: "Profile updated successfully." });

  } catch (err) {
    console.error("Profile API Error:", err);
    return Response.json(
      { success: false, error: "Internal Server Error occurred while saving." },
      { status: 500 }
    );
  }
}