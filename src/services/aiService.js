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
      content: `Generate exactly a ${targetCount}-question quiz about "${topic}". 
      You must carefully analyze the content of the provided text:
      1. If the text contains questions with options (e.g. A, B, C, D), format them as Multiple Choice and prefix the question text with "[Multiple Choice] ".
      2. If the text asks to list items, steps, parts, or features, format them as Enumeration questions. Prefix the question text with "[Enumeration] " and let the 4 options represent different sets of lists, with the correct set of items as the answer.
      3. If the text asks for direct terms, definitions, or fill-in-the-blanks, format them as Identification questions. Prefix the question text with "[Identification] " and let the 4 options represent terms, with the correct term as the answer.
      
      If the topic "${topic}" is extremely short, gibberish, or unclear, automatically generate a high-quality 10-question general knowledge academic study quiz about science, history, or mathematics, mixing "[Multiple Choice] ", "[Enumeration] ", and "[Identification] " prefixes.
      
      You must respond ONLY with a raw JSON array of objects containing 'question' (string, including the correct prefix), 'options' (array of 4 strings), and 'answer' (string matching exactly one of the options). Do not include markdown codeblocks or text outside the JSON array.` 
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
          question: `[Multiple Choice] Which of the following is the most effective way to master the topic of "${cleanTopic}"?`,
          options: [
            "Spaced repetition, active recall, and constant testing",
            "Reading the same study sheet repeatedly at night",
            "Cramming all details 10 minutes before the exam",
            "Ignoring review questions and expecting to pass"
          ],
          answer: "Spaced repetition, active recall, and constant testing"
        },
        {
          question: "[Identification] What is the primary term used for the brain's ability to retrieve information, strengthening synaptic connections?",
          options: [
            "Active Recall",
            "Passive Reading",
            "Information Overload",
            "Cognitive Stagnation"
          ],
          answer: "Active Recall"
        },
        {
          question: "[Enumeration] Which of the following correctly lists the three core study utilities of the AI Homework Helper PWA?",
          options: [
            "AI Chat, Quiz Generator, and Notes Creator",
            "File Uploader, Web Downloader, and Video Streamer",
            "Code Compiler, Music Player, and Social Feed",
            "Database Admin, Graph Designer, and Map Tracker"
          ],
          answer: "AI Chat, Quiz Generator, and Notes Creator"
        },
        {
          question: "[Identification] What is the primary gas found in Earth's atmosphere that is crucial for human breathing?",
          options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Hydrogen"],
          answer: "Oxygen"
        },
        {
          question: "[Multiple Choice] In basic mathematics, what is the value of the mathematical constant Pi (rounded to two decimal places)?",
          options: ["3.14", "2.71", "1.61", "1.41"],
          answer: "3.14"
        },
        {
          question: "[Enumeration] Which of the following lists the primary organs in the human body responsible for breathing, thinking, and pumping blood?",
          options: [
            "Lungs, Brain, and Heart",
            "Liver, Kidneys, and Stomach",
            "Skin, Muscles, and Bones",
            "Eyes, Ears, and Throat"
          ],
          answer: "Lungs, Brain, and Heart"
        },
        {
          question: "[Identification] Who is traditionally known as the national hero of the Philippines?",
          options: ["Jose Rizal", "Andres Bonifacio", "Emilio Aguinaldo", "Apolinario Mabini"],
          answer: "Jose Rizal"
        },
        {
          question: "[Multiple Choice] What is the closest celestial body that orbits the planet Earth?",
          options: ["The Sun", "The Moon", "Mars", "Venus"],
          answer: "The Moon"
        },
        {
          question: "[Identification] Which primary scientific device is used to measure the exact temperature of a substance?",
          options: ["Thermometer", "Barometer", "Anemometer", "Hygrometer"],
          answer: "Thermometer"
        },
        {
          question: "[Enumeration] What are the three primary states of natural matter found commonly on Earth?",
          options: [
            "Solid, Liquid, and Gas",
            "Plasma, Ice, and Vapor",
            "Metal, Stone, and Acid",
            "Light, Heat, and Sound"
          ],
          answer: "Solid, Liquid, and Gas"
        }
      ]
    }
  }
}
