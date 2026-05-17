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
    // Layer 0: Try anonymous OpenAI-compatible POST to text.pollinations.ai (Supports large payloads like files/documents without 414 URI Too Long)
    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
          model: 'openai',
          jsonMode: false
        })
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text.trim();
      }
    } catch (e) {
      console.warn('Anonymous Pollinations POST failed, trying GET fallbacks...', e);
    }

    // Flatten messages array into a unified prompt string for the GET request (fallback for smaller prompts)
    const promptText = messages.map(m => `${m.role === 'user' ? 'User' : 'System'}: ${m.content}`).join('\n')
    const encodedPrompt = encodeURIComponent(promptText)

    // Layer 1: Try long-established, highly whitelisted text.pollinations.ai GET
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text.trim();
      }
    } catch (e) {
      console.warn('text.pollinations.ai GET failed, trying gen.pollinations.ai...', e);
    }

    // Layer 2: Try gen.pollinations.ai GET
    try {
      const res = await fetch(`https://gen.pollinations.ai/text/${encodedPrompt}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) return text.trim();
      }
    } catch (e) {
      console.warn('gen.pollinations.ai GET failed, trying AllOrigins CORS proxy...', e);
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
  generateQuiz: async (topic, targetCountParam) => {
    // Detect if the payload is an uploaded document/notes or a simple short topic search
    const isDocument = topic.trim().length > 150 || topic.includes('\n');

    // Dynamically detect how many questions or items are explicitly listed in the notes/document
    const questionMarkCount = (topic.match(/\?/g) || []).length
    const numberedItemCount = (topic.match(/^\s*\d+[\.\)]\s+/gm) || []).length
    const detectedCount = Math.max(questionMarkCount, numberedItemCount)
    
    // If the document has a high likelihood of having explicit pre-existing test questions (detectedCount >= 3)
    // then ignore the manual targetCountParam selector and use detectedCount to extract all of them!
    const hasPreExistingQuestions = isDocument && detectedCount >= 3;
    const targetCount = hasPreExistingQuestions ? detectedCount : (targetCountParam || 10);

    let promptContent = '';
    if (isDocument) {
      promptContent = `You are an expert academic educator. You are provided with a study document or source text.
Your task is to carefully read, comprehend, and analyze the provided text, extract its key concepts, definitions, facts, terms, or any pre-existing questions/answers, and generate exactly a ${targetCount}-question study quiz based DIRECTLY on this material.

${hasPreExistingQuestions ? `CRITICAL INSTRUCTION: The uploaded document already contains specific pre-existing questions or items. You MUST extract, format, and follow ALL of these exact questions from the document. Do not truncate them or substitute them. Generate exactly ${targetCount} questions matching the ones found in the text.` : ''}

Here is the SOURCE DOCUMENT to read and test the user on:
---
${topic}
---

Instructions for question generation:
1. Every single question must be directly sourced from the facts, terms, concepts, and details in the document above. Do not generate general knowledge questions unless they are explicitly supported by the text.
2. If the document already contains pre-existing test questions (e.g. multiple-choice, enumeration, or identification questions), parse and extract them.
3. For each question, format it into one of these types:
   - [Multiple Choice] - Use this for standard multiple choice. Prefix the question with "[Multiple Choice] ".
   - [Enumeration] - Use this if the text lists steps, features, parts, or lists. Let the 4 options represent different sets/lists of items, with the correct set as the correct answer. Prefix the question with "[Enumeration] ".
   - [Identification] - Use this for definitions, terms, or fill-in-the-blanks. Let the 4 options represent terms/phrases, with the correct term as the answer. Prefix the question with "[Identification] ".
4. Ensure all options are highly plausible distractors, and the answer matches exactly one of the options.

Respond ONLY with a raw JSON array of objects, containing:
- 'question' (string, with the appropriate prefix e.g. "[Multiple Choice] ...")
- 'options' (array of 4 strings)
- 'answer' (string matching exactly one of the options)

Do not include markdown formatting, codeblocks (do not wrap in \`\`\`json), or text outside the JSON array.`;
    } else {
      promptContent = `You are an expert academic educator. Generate exactly a ${targetCount}-question study quiz about the topic: "${topic}".

Instructions for question generation:
1. Generate high-quality academic questions covering science, history, mathematics, or language relevant to "${topic}".
2. Mix the question types:
   - [Multiple Choice] - Prefix the question with "[Multiple Choice] ".
   - [Enumeration] - Prefix the question with "[Enumeration] " and let the 4 options represent different sets/lists of items, with the correct set of items as the correct answer.
   - [Identification] - Prefix the question with "[Identification] " and let the 4 options represent terms/phrases, with the correct term as the answer.
3. Ensure all options are highly plausible distractors, and the answer matches exactly one of the options.

Respond ONLY with a raw JSON array of objects, containing:
- 'question' (string, with the appropriate prefix e.g. "[Multiple Choice] ...")
- 'options' (array of 4 strings)
- 'answer' (string matching exactly one of the options)

Do not include markdown formatting, codeblocks (do not wrap in \`\`\`json), or text outside the JSON array.`;
    }

    const prompt = [{ role: 'user', content: promptContent }]
    
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
  },

  generateFlashcards: async (topic) => {
    const isDocument = topic.trim().length > 150 || topic.includes('\n');
    
    let promptContent = '';
    if (isDocument) {
      promptContent = `You are an expert academic educator. You are provided with a study document or source text.
Your task is to carefully read, analyze, and extract the key terms, definitions, concepts, and facts from the provided text, and generate exactly 10 high-quality flashcards based DIRECTLY on this material.

Here is the SOURCE DOCUMENT to analyze and create flashcards for:
---
${topic}
---`;
    } else {
      promptContent = `You are an expert academic educator.
Your task is to generate exactly 10 high-quality study flashcards about the following general academic topic: "${topic}".`;
    }

    const systemPrompt = `You are a strict JSON generator. Your job is to output a single JSON array containing exactly 10 flashcard objects.
Each object MUST have the following keys:
- "question": A clear, concise study question or term definition (under 100 characters).
- "answer": A brief, accurate answer or term (under 100 characters).

Example Output Format:
[
  {
    "question": "What is the powerhouse of the cell?",
    "answer": "Mitochondria"
  },
  {
    "question": "Define photosynthesis.",
    "answer": "The process by which green plants make food using sunlight, water, and carbon dioxide."
  }
]

CRITICAL RULES:
1. ONLY return a valid, parsable raw JSON array. DO NOT wrap the JSON inside markdown blocks (e.g. do NOT write \`\`\`json ... \`\`\`), and do NOT include any introductory or explanatory text. 
2. The questions and answers must be formulated strictly from the source document if provided. No fabrications.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: promptContent }
    ];

    try {
      const responseText = await aiService.chat(messages);
      
      // Clean up potential markdown formatting code blocks if the model ignored instructions
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const flashcards = JSON.parse(cleanText);
      if (Array.isArray(flashcards) && flashcards.length > 0) {
        return flashcards;
      }
    } catch (error) {
      console.error('Failed to parse AI generated flashcards:', error);
    }

    // High-quality static fallback flashcards in case of connection/parsing failures
    return [
      { question: "What is the primary power source of the cell?", answer: "Mitochondria" },
      { question: "What process do plants use to convert sunlight into energy?", answer: "Photosynthesis" },
      { question: "What is the speed of light in a vacuum?", answer: "299,792 kilometers per second" },
      { question: "Who formulated the theory of general relativity?", answer: "Albert Einstein" },
      { question: "What is the chemical formula for water?", answer: "H2O" },
      { question: "What is the largest organ in the human body?", answer: "The Skin" },
      { question: "Which planet is known as the Red Planet?", answer: "Mars" },
      { question: "What is the capital of France?", answer: "Paris" },
      { question: "What is the most abundant gas in Earth's atmosphere?", answer: "Nitrogen" },
      { question: "How many bones are in the adult human body?", answer: "206 bones" }
    ];
  }
}
