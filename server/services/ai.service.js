import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

/**
 * OpenAI client initialization
 */
let openai;

try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    } else {
        console.warn("OPENAI_API_KEY is missing. AI features will be disabled.");
    }
} catch (error) {
    console.error("Failed to initialize OpenAI client:", error);
    openai = null;
}

/**
 * Fallback topic breakdown (used when AI is unavailable or errors occur)
 */
const fallbackTopics = (subject) => ([
    { name: `${subject} - Introduction`, estimatedMinutes: 30, difficultyScore: 0.3 },
    { name: `${subject} - Core Concepts`, estimatedMinutes: 45, difficultyScore: 0.5 },
    { name: `${subject} - Applied Practice`, estimatedMinutes: 45, difficultyScore: 0.6 }
]);

/**
 * Decomposes a broad subject into atomic study topics
 * @param {string} subject
 * @param {string} context
 * @returns {Promise<Array<{name: string, estimatedMinutes: number, difficultyScore: number}>>}
 */
export const generateTopicBreakdown = async (subject, context = "") => {
    if (!openai) {
        console.warn("AI unavailable. Using fallback topic breakdown.");
        return fallbackTopics(subject);
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content: "You are an expert curriculum designer. You output strict, valid JSON only."
                },
                {
                    role: "user",
                    content: `
Break down the subject "${subject}" into meaningful, atomic study topics unique to this subject.

Optional context (syllabus or notes):
${context || "None"}

Rules:
- Output ONLY valid JSON
- Output MUST be a JSON array
- 5–10 topics maximum
- Each object must include:
  - name (string)
  - estimatedMinutes (number between 15 and 60)
  - difficultyScore (number between 0.1 and 1.0)
`
                }
            ]
        });

        const rawContent = completion.choices[0].message.content;
        const parsed = JSON.parse(rawContent);

        if (!Array.isArray(parsed)) {
            throw new Error("AI response was not a JSON array");
        }

        return parsed;
    } catch (error) {
        console.error("AI Topic Breakdown Error:", error);
        return fallbackTopics(subject);
    }
};

/**
 * Analyzes a completed study session and returns short qualitative feedback
 * @param {Object} sessionData
 * @returns {Promise<string>}
 */
export const analyzeSession = async (sessionData) => {
    if (!openai) {
        return "Great job! AI feedback is unavailable right now, but consistency matters most.";
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            temperature: 0.5,
            messages: [
                {
                    role: "system",
                    content: "You are a concise, encouraging study coach."
                },
                {
                    role: "user",
                    content: `
Analyze this study session and provide 1–2 sentences of actionable, encouraging advice.

Topic: ${sessionData.topicName}
Duration: ${sessionData.durationMinutes} minutes
Difficulty Rating: ${sessionData.difficultyRating}/5
Focus Rating: ${sessionData.focusRating}/5
Notes: "${sessionData.notes || "No notes"}"
`
                }
            ]
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI Session Analysis Error:", error);
        return "Nice work completing your session. Keep building momentum!";
    }
};
