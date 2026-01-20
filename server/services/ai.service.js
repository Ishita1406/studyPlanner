import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

let openai;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else {
        console.warn("OPENAI_API_KEY is missing. AI features will not work.");
    }
} catch (error) {
    console.error("Failed to initialize OpenAI:", error);
}

/**
 * Decomposes a broad subject into atomic study topics
 * @param {string} subject - The main subject (e.g. "Biology", "Calculus")
 * @param {string} context - Optional syllabus text or user notes
 * @returns {Promise<Array>} List of topics with estimates
 */
export const generateTopicBreakdown = async (subject, context = "") => {
    if (!openai) {
        console.warn("AI service not initialized. Returning fallback topics.");
        return [
            { name: `${subject} - Intro`, estimatedMinutes: 30, difficultyScore: 0.3 },
            { name: `${subject} - Core Concepts`, estimatedMinutes: 45, difficultyScore: 0.5 },
            { name: `${subject} - Practice`, estimatedMinutes: 45, difficultyScore: 0.6 }
        ];
    }
    try {
        const prompt = `Break down the subject "${subject}" into meaningful, atomic study topics unique to this subject. 
        Context: ${context}.
        Return a JSON array of objects with keys: name (string), estimatedMinutes (number between 15-60), difficultyScore (number 0.1-1.0).
        Limit to 5-10 topics. JSON ONLY.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        const result = JSON.parse(content);
        return result.topics || result; // Handle { topics: [...] } wrapper if LLM adds it
    } catch (error) {
        console.error("AI Topic Breakdown Error:", error);
        // Fallback to mock data on error (e.g. quota exceeded)
        return [
            { name: `${subject} - Intro`, estimatedMinutes: 30, difficultyScore: 0.3 },
            { name: `${subject} - Core Concepts`, estimatedMinutes: 45, difficultyScore: 0.5 },
            { name: `${subject} - Practice`, estimatedMinutes: 45, difficultyScore: 0.6 }
        ];
    }
};

/**
 * Analyzes session feedback to provide qualitative advice
 * @param {Object} sessionData - { difficulty, focus, notes, topicName }
 * @returns {Promise<string>} Specific advice
 */
export const analyzeSession = async (sessionData) => {
    if (!openai) {
        return { feedback: "Great job! (AI features unavailable - check API key)" };
    }
    try {
        const prompt = `Analyze this study session:
        Topic: ${sessionData.topicName}
        Duration: ${sessionData.durationMinutes}m
        User Difficulty Rating: ${sessionData.difficultyRating}/5
        User Focus Rating: ${sessionData.focusRating}/5
        Notes: "${sessionData.notes || "No notes"}"
      
      Provide 1-2 sentences of specific, encouraging advice or a strategic tip for next time.
      Keep it brief and actionable.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI Session Analysis Error:", error);
        return "Great job completing your session! (AI is offline, but keep up the consistency!)";
    }
};
