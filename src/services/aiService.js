const API_KEY = import.meta.env.VITE_AI_API_KEY
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export const aiService = {
  chat: async (messages) => {
    if (!API_KEY || API_KEY.includes('your-')) {
      console.log('No valid Groq API key, launching Pollinations fallback...');
      return await aiService.fallbackChat(messages);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error, trying Pollinations fallback:', error);
      return await aiService.fallbackChat(messages);
    }
  },

  fallbackChat: async (messages) => {
    try {
      const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          model: 'openai',
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error(`Fallback API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
      throw new Error('Received invalid JSON format from fallback API');
    } catch (err) {
      console.error('All AI endpoints failed:', err);
      return "Sorry, I encountered an error while processing your request.";
    }
  },
  
  summarize: async (text) => {
    const prompt = [{ role: 'user', content: `Please summarize the following study notes in a clear, concise bullet-point format: ${text}` }]
    return await aiService.chat(prompt)
  },
  
  generateQuiz: async (topic) => {
    const prompt = [{ 
      role: 'user', 
      content: `Generate a 3-question multiple choice quiz about "${topic}". You must respond ONLY with a raw JSON array of objects containing 'question', 'options' (array of 4), and 'answer'. Do not include markdown codeblocks or text outside the JSON array.` 
    }]
    const response = await aiService.chat(prompt)
    try {
      // Basic extraction of JSON if the model includes surrounding text
      const jsonMatch = response.match(/\[.*\]/s)
      return JSON.parse(jsonMatch ? jsonMatch[0] : response)
    } catch (e) {
      console.error('Quiz parsing error:', e)
      return [{ question: "Failed to generate quiz questions.", options: [], answer: "" }]
    }
  }
}
