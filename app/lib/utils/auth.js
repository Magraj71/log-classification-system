import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "logclassify-secret-key-2024";

/**
 * Verify a JWT token from the Authorization header.
 * @param {Request} req - The incoming request
 * @returns {{ userId: string, email: string } | null} Decoded payload or null
 */
export function verifyToken(req) {
  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { userId, email, ... }
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

/**
 * Extract userId from request - tries JWT first, falls back to body/query
 * @param {Request} req 
 * @returns {string|null}
 */
export function getUserId(req) {
  const decoded = verifyToken(req);
  if (decoded?.userId) return decoded.userId;
  if (decoded?.id) return decoded.id;
  return null;
}
