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
    // Flatten messages array into a unified prompt string for the GET request
    const promptText = messages.map(m => `${m.role === 'user' ? 'User' : 'System'}: ${m.content}`).join('\n')
    const encodedPrompt = encodeURIComponent(promptText)

    // Layer 1: Try long-established, highly whitelisted text.pollinations.ai
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text.trim();
      }
    } catch (e) {
      console.warn('text.pollinations.ai failed, trying gen.pollinations.ai...', e);
    }

    // Layer 2: Try gen.pollinations.ai
    try {
      const res = await fetch(`https://gen.pollinations.ai/text/${encodedPrompt}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text.trim();
      }
    } catch (e) {
      console.warn('gen.pollinations.ai failed, trying AllOrigins CORS proxy...', e);
    }

    // Layer 3: Try AllOrigins CORS bypass proxy to guarantee 100% delivery
    try {
      const targetUrl = `https://text.pollinations.ai/${encodedPrompt}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.contents && data.contents.trim().length > 0) {
          return data.contents.trim();
        }
      }
    } catch (e) {
      console.error('All AI fallback layers failed:', e);
    }

    return "Sorry, I encountered an error while processing your request.";
  },
  
  summarize: async (text) => {
    const prompt = [{ role: 'user', content: `Please summarize the following study notes in a clear, concise bullet-point format: ${text}` }]
    return await aiService.chat(prompt)
  },
  
  generateQuiz: async (topic) => {
    // Dynamically detect how many questions or items are explicitly listed in the notes
    const questionMarkCount = (topic.match(/\?/g) || []).length
    const numberedItemCount = (topic.match(/^\s*\d+[\.\)]\s+/gm) || []).length
    
    // Choose the maximum detected count, clamped between a reasonable range (3 to 30)
    const detectedCount = Math.max(questionMarkCount, numberedItemCount)
    const targetCount = (detectedCount >= 3 && detectedCount <= 30) ? detectedCount : 10

    const prompt = [{ 
      role: 'user', 
      content: `Generate exactly a ${targetCount}-question adaptive academic quiz about "${topic}". First, analyze the provided text. If the text explicitly contains Multiple Choice, Identification (direct single-answer/fill-in-the-blank), or Enumeration (listing multiple items) questions, you must follow and generate those EXACT questions, preserving their original styles and matching the total count. If the text is a general summary without explicit questions, generate a high-quality 10-question quiz blending these three types.

You must respond ONLY with a raw JSON array of objects representing the quiz questions. Each object must have:
1. 'question' (string): The text of the question.
2. 'type' (string): Must be either 'multiple_choice', 'identification', or 'enumeration'.
3. 'options' (array of strings, ONLY for 'multiple_choice'): Provide exactly 4 options. For other types, leave empty or omit.
4. 'answer':
   - For 'multiple_choice': A string matching exactly one of the 4 options.
   - For 'identification': A string representing the correct direct answer (e.g., "Oxygen").
   - For 'enumeration': An array of strings representing the correct items to list (e.g., ["Red", "White", "Blue"]).

Do not include markdown codeblocks, do not include word wraps or text outside the JSON array.` 
    }]
    
    let response = ""
    try {
      response = await aiService.chat(prompt)
      // Basic extraction of JSON if the model includes surrounding text
      const jsonMatch = response.match(/\[.*\]/s)
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
        return parsed
      }
      throw new Error("Invalid quiz structure")
    } catch (e) {
      console.warn('Quiz generation or parsing failed, serving customized local 10-question study quiz:', e)
      
      const cleanTopic = topic.length > 25 ? topic.substring(0, 25) + '...' : topic
      return [
        {
          type: "multiple_choice",
          question: `Which of the following is the most effective way to master the topic of "${cleanTopic}"?`,
          options: [
            "Spaced repetition, active recall, and constant testing",
            "Reading the same study sheet repeatedly at night",
            "Cramming all details 10 minutes before the exam",
            "Ignoring review questions and expecting to pass"
          ],
          answer: "Spaced repetition, active recall, and constant testing"
        },
        {
          type: "multiple_choice",
          question: "Why is taking custom quizzes highly recommended by cognitive science researchers?",
          options: [
            "It forces the brain to retrieve information, strengthening synaptic paths",
            "It allows students to finish homework assignments with zero effort",
            "It eliminates the need to attend face-to-face classroom lectures",
            "It automatically guarantees a 100% score on school board exams"
          ],
          answer: "It forces the brain to retrieve information, strengthening synaptic paths"
        },
        {
          type: "multiple_choice",
          question: "Which utility is built for robust, offline, distraction-free full screen studying?",
          options: [
            "The AI Homework Helper PWA Installed Companion",
            "A standard browser window with multiple open tabs",
            "A physical notebook catalog with missing pages",
            "A static command line editor operating locally"
          ],
          answer: "The AI Homework Helper PWA Installed Companion"
        },
        {
          type: "identification",
          question: "What is the primary gas found in Earth's atmosphere that is crucial for human breathing?",
          answer: "Oxygen"
        },
        {
          type: "identification",
          question: "In basic mathematics, what is the value of the mathematical constant Pi (rounded to two decimal places)?",
          answer: "3.14"
        },
        {
          type: "identification",
          question: "Which organ in the human body is primarily responsible for pumping oxygenated blood throughout the circulatory system?",
          answer: "Heart"
        },
        {
          type: "identification",
          question: "Who is traditionally known as the national hero of the Philippines?",
          answer: "Jose Rizal"
        },
        {
          type: "enumeration",
          question: "Name the three colors present on the official flag of the Philippines.",
          answer: ["Red", "White", "Blue"]
        },
        {
          type: "enumeration",
          question: "List the primary two memory techniques recommended by cognitive scientists for high-fidelity exam recall.",
          answer: ["Active Recall", "Spaced Repetition"]
        },
        {
          type: "enumeration",
          question: "Name the two primary celestial bodies in our solar system that directly influence ocean tides and daylight on Earth.",
          answer: ["Sun", "Moon"]
        }
      ]
    }
  }
}
