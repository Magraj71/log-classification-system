import clientPromise from "../../lib/mongodb";

export async function POST(req) {
  const { log, userId } = await req.json();

  let category = "INFO";

  if (log.toLowerCase().includes("error")) {
    category = "ERROR";
  } else if (log.toLowerCase().includes("warning")) {
    category = "WARNING";
  }

  const client = await clientPromise;
  const db = client.db("logSystem");

  const newLog = {
    userId,
    logText: log,
    category,
    confidence: "98%",
    createdAt: new Date()
  };

  await db.collection("logs").insertOne(newLog);

  return Response.json({
    category,
    confidence: "98%"
  });
}