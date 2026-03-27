import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing or invalid Authorization header. Expected 'Bearer sk_log_...'" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const client = await clientPromise;
    const authDb = client.db("next_auth_db");
    const logDb = client.db("logSystem");
    
    // Verify user by API Key
    const user = await authDb.collection("users").findOne({ "apiKeys.key": token });
    if (!user) {
      return NextResponse.json({ error: "Invalid Developer API Key" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { logData, sourceCode } = body;
    if (!logData) return NextResponse.json({ error: "No logData provided" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are an expert software engineer and log analysis AI. 
Your primary task is to receive an error log and optional source code, analyze it, and return a robust JSON Object.

JSON Output ONLY. Do NOT wrap the JSON in markdown formatting (like \`\`\`json). The output must be EXACTLY valid parseable JSON.

The object must strictly follow this shape:
{
  "errorSummary": "A brief one-sentence summary of what the error is.",
  "rootCause": "A detailed explanation of why this error occurred based on the log.",
  "resolutionSteps": [
    "Step 1 to fix the error",
    "Step 2 to fix the error",
    "etc."
  ],
  "category": "ERROR, WARNING, or INFO",
  "confidence": 95,
  "correctedCode": "The full corrected source code snippet here if applicable, or null if no code provided or no fix needed."
}

Here is the log:
${logData}

Here is the related source code (if any):
${sourceCode || "None provided."}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch (e) {
      console.error("AI Output Parse Error:", cleanText);
      return NextResponse.json({ error: "Generative AI failed to return valid JSON." }, { status: 500 });
    }

    // Save this log via API to the logs DB
    const logRecord = {
      logText: logData,
      sourceCode: sourceCode || null,
      ...analysis,
      userId: user._id, 
      developerApi: true,
      createdAt: new Date()
    };
    await logDb.collection("logs").insertOne(logRecord);

    // Update lastUsed timestamp on the API key
    await authDb.collection("users").updateOne(
      { _id: user._id, "apiKeys.key": token },
      { $set: { "apiKeys.$.lastUsed": new Date().toLocaleDateString() } }
    );

    return NextResponse.json(logRecord, { status: 201 });
  } catch (err) {
    console.error("V1 API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
