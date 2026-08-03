const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default model to use (Groq's fast & high quality model)
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are EcoBot 🌿, a friendly, expert AI sustainability assistant for CarbonTrack.
Your goal is to help users understand their carbon footprint, reduce emissions, adopt sustainable habits, and make the most of the CarbonTrack app.

Key Guidelines:
- Keep answers concise, clear, and encouraging.
- Format responses using Markdown (bolding, lists, emojis).
- Provide practical advice for travel, energy, diet, shopping, and green lifestyle choices.
- Help users understand metrics like CO₂e (kg/tons of carbon equivalent).
- Be polite, supportive, and action-oriented!`
};

/**
 * Sends chat messages to Groq API and returns the assistant response.
 * @param {Array<{role: string, content: string}>} conversationHistory 
 * @returns {Promise<string>}
 */
export async function sendGroqChatMessage(conversationHistory) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Groq API Key is missing. Please set VITE_GROQ_API_KEY in your .env file.');
  }

  const messages = [SYSTEM_PROMPT, ...conversationHistory];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      // Try fallback model if primary model hits rate limit or error
      const fallbackResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!fallbackResponse.ok) {
        const errorData = await fallbackResponse.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Groq API Error: ${response.status}`);
      }

      const data = await fallbackResponse.json();
      return data.choices[0]?.message?.content || "I couldn't generate a response at the moment.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error('Groq AI API Error:', error);
    throw error;
  }
}
