import clientPromise from "../../lib/mongodb";

export async function GET() {

  const client = await clientPromise;
  const db = client.db("logSystem");

  const logs = await db
    .collection("logs")
    .find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return Response.json(logs);
}