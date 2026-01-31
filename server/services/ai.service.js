import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

/**
 * ======================================================
 * Hugging Face Router Client (OpenAI-Compatible)
 * ======================================================
 */

let client;

const getClient = () => {
    if (!client) {
        if (!process.env.HF_API_KEY) {
            console.warn("❌ HF_API_KEY missing. AI features disabled.");
            return null;
        }

        client = new OpenAI({
            baseURL: "https://router.huggingface.co/v1",
            apiKey: process.env.HF_API_KEY,
        });

        console.log("✅ Hugging Face Router client initialized");
    }

    return client;
};

/**
 * ======================================================
 * Helpers
 * ======================================================
 */

/**
 * Fallback topic breakdown when AI fails
 */
const fallbackTopics = (subject) => [
    {
        name: `${subject} - Introduction`,
        estimatedMinutes: 30,
        difficultyScore: 0.3,
    },
    {
        name: `${subject} - Core Concepts`,
        estimatedMinutes: 45,
        difficultyScore: 0.5,
    },
    {
        name: `${subject} - Applied Practice`,
        estimatedMinutes: 45,
        difficultyScore: 0.6,
    },
];

/**
 * Safe JSON parser
 */
const safeParseJSON = (raw) => {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

/**
 * Clean AI output (remove markdown wrappers)
 */
const cleanJSONOutput = (text) => {
    if (!text) return "";
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * ======================================================
 * AI: Topic Breakdown Generator
 * ======================================================
 */

export const generateTopicBreakdown = async (subject, context = "") => {
    try {
        const aiClient = getClient();
        if (!aiClient) return fallbackTopics(subject);

        const response = await aiClient.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct",
            temperature: 0.3,
            max_tokens: 700,

            messages: [
                {
                    role: "system",
                    content: `
You are an expert curriculum designer.
Return ONLY valid JSON array.
No markdown. No explanation.
          `,
                },
                {
                    role: "user",
                    content: `
Break down the subject "${subject}" into meaningful atomic study topics.

Context:
${context || "None"}

Rules:
- Output ONLY JSON array
- 5–10 topics max
- Each topic must include:
  - name (string)
  - estimatedMinutes (15–60)
  - difficultyScore (0.1–1.0)

Return format:
[
  {
    "name": "...",
    "estimatedMinutes": 30,
    "difficultyScore": 0.4
  }
]
          `,
                },
            ],
        });

        let content = cleanJSONOutput(response.choices?.[0]?.message?.content);

        if (!content) throw new Error("Empty AI response");

        const parsed = safeParseJSON(content);

        if (!Array.isArray(parsed)) throw new Error("AI output not an array");

        return parsed;
    } catch (err) {
        console.error("❌ Topic Breakdown Error:", err);
        return fallbackTopics(subject);
    }
};

/**
 * ======================================================
 * AI: Study Session Feedback
 * ======================================================
 */

export const analyzeSession = async (sessionData) => {
    try {
        const aiClient = getClient();
        if (!aiClient) {
            return "Great job! Keep building consistency.";
        }

        const response = await aiClient.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct",
            temperature: 0.5,
            max_tokens: 200,

            messages: [
                {
                    role: "system",
                    content: `
You are a concise, encouraging study coach.
Reply in 1–2 actionable sentences only.
          `,
                },
                {
                    role: "user",
                    content: `
Analyze this completed study session:

Topic: ${sessionData.topicName}
Duration: ${sessionData.durationMinutes} minutes
Difficulty: ${sessionData.difficultyRating}/5
Focus: ${sessionData.focusRating}/5
Notes: "${sessionData.notes || "None"}"
          `,
                },
            ],
        });

        return (
            response.choices?.[0]?.message?.content?.trim() ||
            "Nice work — keep going!"
        );
    } catch (err) {
        console.error("❌ Session Analysis Error:", err);
        return "Nice work completing your session. Keep building momentum!";
    }
};

/**
 * ======================================================
 * AI: Daily Study Schedule Generator
 * ======================================================
 */

export const generateDailySchedule = async (availableMinutes, topics) => {
    try {
        const aiClient = getClient();
        if (!aiClient) return null;

        /**
         * Reduce prompt size for safety
         */
        const trimmedTopics = topics.slice(0, 10);

        const response = await aiClient.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct",
            temperature: 0.2,
            max_tokens: 500,

            messages: [
                {
                    role: "system",
                    content: `
You are an expert study planner.
DO NOT explain.
DO NOT output reasoning.
Return ONLY valid JSON array.
No markdown. No extra text.
          `,
                },
                {
                    role: "user",
                    content: `
User available time: ${availableMinutes} minutes.

Pending topics:
${JSON.stringify(trimmedTopics, null, 2)}

Rules:
1. Prioritize high importance subjects (5 highest)
2. Prioritize closest upcoming exams first
3. Total plannedMinutes MUST NOT exceed ${availableMinutes}
4. Output ONLY JSON array

Return format:
[
  { "topicId": "...", "plannedMinutes": 30 }
]
          `,
                },
            ],
        });

        let content = cleanJSONOutput(response.choices?.[0]?.message?.content);

        if (!content) throw new Error("AI returned empty response");

        const parsed = safeParseJSON(content);

        console.log("✅ AI Schedule Output:", parsed);

        if (!parsed) {
            console.error("❌ Invalid JSON returned:", content);
            return null;
        }

        if (!Array.isArray(parsed)) {
            console.error("❌ AI output was not an array:", parsed);
            return null;
        }

        return parsed;
    } catch (err) {
        console.error("❌ Schedule AI Error:", err);
        return null;
    }
};
