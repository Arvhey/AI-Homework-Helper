const API_KEY = import.meta.env.VITE_AI_API_KEY
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export const aiService = {
  chat: async (messages) => {
    if (!API_KEY || API_KEY.includes('your-')) {
      return "Please set a valid Groq API key in your .env file."
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
      })

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq API Error:', error)
      return "Sorry, I encountered an error while processing your request."
    }
  },
  
  summarize: async (text) => {
    const prompt = [{ role: 'user', content: `Please summarize the following study notes in a clear, concise bullet-point format: ${text}` }]
    return await aiService.chat(prompt)
  },
  
  generateQuiz: async (topic) => {
    const prompt = [{ 
      role: 'user', 
      content: `Generate a 3-question multiple choice quiz about "${topic}". Return ONLY a JSON array with objects containing 'question', 'options' (array of 4), and 'answer'.` 
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
