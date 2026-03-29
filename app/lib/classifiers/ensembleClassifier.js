/**
 * Ensemble Classifier
 * Orchestrates Regex, NLP, and Gemini classifiers.
 * Runs Regex + NLP in parallel (fast), then optionally Gemini (slow).
 * Combines results with weighted voting.
 */

import { classifyWithRegex } from "./regexClassifier.js";
import { classifyWithNLP } from "./nlpClassifier.js";
import { scoreSeverity } from "./severityScorer.js";

// Weights for each classifier in the ensemble
const WEIGHTS = {
  Regex: 0.25,
  NLP: 0.25,
  Gemini: 0.50
};

// Category priority for tie-breaking: ERROR > WARNING > INFO
const CATEGORY_PRIORITY = { ERROR: 3, WARNING: 2, INFO: 1 };

/**
 * Run all classifiers and combine results
 * @param {string} logText - The log text to classify
 * @param {object|null} geminiResult - Optional result from Gemini API (category + confidence)
 * @returns {object} Combined classification with individual breakdowns
 */
export function runEnsemble(logText, geminiResult = null) {
  const totalStartTime = performance.now();

  // Run fast classifiers
  const regexResult = classifyWithRegex(logText);
  const nlpResult = classifyWithNLP(logText);

  // Build classifiers array
  const classifiers = [
    {
      method: "Regex",
      icon: "🔍",
      category: regexResult.category,
      confidence: regexResult.confidence,
      timeMs: regexResult.timeMs,
      details: {
        patternsMatched: regexResult.patternsMatched
      }
    },
    {
      method: "NLP",
      icon: "📝",
      category: nlpResult.category,
      confidence: nlpResult.confidence,
      timeMs: nlpResult.timeMs,
      details: {
        sentiment: nlpResult.sentiment,
        keywords: nlpResult.keywords,
        entities: nlpResult.entities
      }
    }
  ];

  // If Gemini result provided, include it
  if (geminiResult) {
    classifiers.push({
      method: "Gemini",
      icon: "🤖",
      category: geminiResult.category || "INFO",
      confidence: typeof geminiResult.confidence === "number" 
        ? geminiResult.confidence 
        : parseInt(geminiResult.confidence) || 80,
      timeMs: geminiResult.timeMs || 0,
      details: {
        model: "gemini-flash-latest"
      }
    });
  }

  // Weighted voting for combined category
  const categoryScores = { ERROR: 0, WARNING: 0, INFO: 0 };

  for (const clf of classifiers) {
    const weight = WEIGHTS[clf.method] || 0.33;
    const normalizedConfidence = clf.confidence / 100;
    categoryScores[clf.category] = (categoryScores[clf.category] || 0) + (weight * normalizedConfidence);
  }

  // If no Gemini, redistribute its weight equally
  if (!geminiResult) {
    // Effectively Regex=0.50, NLP=0.50
    for (const key of Object.keys(categoryScores)) {
      categoryScores[key] = categoryScores[key] / 0.50; // Normalize to sum of available weights
    }
  }

  // Find winning category
  let combinedCategory = "INFO";
  let maxScore = 0;

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore || (score === maxScore && CATEGORY_PRIORITY[category] > CATEGORY_PRIORITY[combinedCategory])) {
      maxScore = score;
      combinedCategory = category;
    }
  }

  // Calculate combined confidence (weighted average of all classifiers)
  let totalWeight = 0;
  let weightedConfidenceSum = 0;

  for (const clf of classifiers) {
    const w = WEIGHTS[clf.method] || 0.33;
    // Only count classifiers that agree with the final category
    if (clf.category === combinedCategory) {
      weightedConfidenceSum += w * clf.confidence;
      totalWeight += w;
    } else {
      // Disagreeing classifiers reduce confidence slightly
      weightedConfidenceSum += w * clf.confidence * 0.3;
      totalWeight += w;
    }
  }

  let combinedConfidence = totalWeight > 0 ? Math.round(weightedConfidenceSum / totalWeight) : 50;
  
  // Boost if all classifiers agree
  const allAgree = classifiers.every(c => c.category === combinedCategory);
  if (allAgree && classifiers.length >= 2) {
    combinedConfidence = Math.min(99, combinedConfidence + 5);
  }

  combinedConfidence = Math.max(10, Math.min(99, combinedConfidence));

  // Calculate severity
  const severity = scoreSeverity(logText, combinedCategory);

  const totalTimeMs = Math.round((performance.now() - totalStartTime) * 100) / 100;

  // Build combined result
  const combined = {
    method: "Combined",
    icon: "⚡",
    category: combinedCategory,
    confidence: combinedConfidence,
    timeMs: totalTimeMs,
    details: {
      agreement: allAgree ? "Full Agreement" : "Majority Vote",
      categoryScores
    }
  };

  return {
    // Final result
    category: combinedCategory,
    confidence: combinedConfidence,
    severity,

    // Individual classifier results for comparison table
    classifiers: [...classifiers, combined],

    // Extra analysis data
    analysis: {
      regexPatterns: regexResult.patternsMatched,
      nlpSentiment: nlpResult.sentiment,
      nlpKeywords: nlpResult.keywords,
      nlpEntities: nlpResult.entities,
      agreement: allAgree,
      totalTimeMs
    }
  };
}
