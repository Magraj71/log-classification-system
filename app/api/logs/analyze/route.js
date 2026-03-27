import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
    }
    
    const { logData, sourceCode } = body;

    if (!logData) {
      return NextResponse.json({ error: "No log data provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Server configuration error: Gemini API key missing." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-flash-latest which is available for this API key
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are an expert software engineer and log analysis AI. 
Analyze the following error log. Give your output as a JSON object with the following keys and exact structure, without any markdown formatting around the json block:
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
    
    // The output might occasionally contain markdown code blocks, let's clean it up
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", cleanText);
      return NextResponse.json({ error: "AI response format was invalid. Please try again." }, { status: 500 });
    }

    // Save to Database
    try {
      const client = await clientPromise;
      const db = client.db("logSystem");
      await db.collection("logs").insertOne({
        logText: logData,
        sourceCode: sourceCode || null,
        ...analysis,
        createdAt: new Date()
      });
    } catch (dbError) {
      console.error("Failed to save log to DB:", dbError);
      // We still return the analysis to the user even if DB save fails
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("Error analyzing log:", error);
    return NextResponse.json({ error: "Failed to analyze log" }, { status: 500 });
  }
}
