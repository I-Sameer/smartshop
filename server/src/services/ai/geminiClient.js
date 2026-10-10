import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';

export class GeminiClient {
  static getModel() {
    return env.GEMINI_MODEL || 'gemini-3.5-flash';
  }

  static getApiKey() {
    return env.GEMINI_API_KEY;
  }

  static getClient() {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch (err) {
      console.warn('[Gemini Client] Initialization:', err.message);
      return null;
    }
  }

    static lastError = null;

  static async generate(prompt, systemInstruction = '') {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    if (!apiKey) {
      console.warn('[Gemini Client] No GEMINI_API_KEY found in environment or server/.env');
      return null;
    }

    // 1. Try official @google/genai SDK
    try {
      const ai = this.getClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined
        });
        if (response && response.text) {
          this.lastError = null;
          return {
            text: response.text.trim(),
            model,
            engine: 'GOOGLE_GENAI_SDK'
          };
        }
      }
    } catch (err) {
      this.lastError = err.message || String(err);
      console.warn('[Gemini SDK Error]:', err.message || err);
    }

    // 2. Direct REST endpoints with verified models
    const candidateModels = [model, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'];
    const uniqueModels = [...new Set(candidateModels.filter(Boolean))];

    for (const m of uniqueModels) {
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${apiKey}`
      ];

      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);

          const res = await fetch(endpoint, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
            })
          });

          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              this.lastError = null;
              return {
                text: text.trim(),
                model: m,
                engine: 'GEMINI_REST_API'
              };
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            this.lastError = errData?.error?.message || `HTTP ${res.status}`;
          }
        } catch (fetchErr) {
          this.lastError = fetchErr.message;
        }
      }
    }

    return null;
  }

  static async generateShoppingAdvice(query, products) {
    const productSummaries = products.map((p, i) => 
      `${i + 1}. ${p.name} ($${p.price}, ${p.rating}★, Specs: ${JSON.stringify(p.specifications || {})})`
    ).join('\n');

    const prompt = `You are an expert autonomous e-commerce laptop advisor.
User inquiry: "${query}"

Here are the top matched products in inventory:
${productSummaries}

Write a concise, personalized, high-value advice paragraph (2-3 sentences) directly addressing the user's specific workflow and explaining which machine is the best match and why. Avoid generic filler words.`;

    const result = await this.generate(prompt, 'You are a technical hardware advisor. Be direct, authoritative, and specific.');
    return result ? result.text : null;
  }

  static async analyzeShoppingIntent(query) {
    const prompt = `Analyze this user e-commerce query for laptops and electronics.
User query: "${query}"

Return a valid JSON object with the following fields:
- "interpretedRequirement": A concise 1-sentence requirement summary tailored specifically to what the user wants.
- "budget": The maximum numerical budget mentioned in USD, or null if none specified.
- "extractedFeatures": An array of technical features or hardware specs directly implied by the query (e.g. ["16GB+ RAM", "SSD Storage", "Dedicated GPU"]).
- "useCases": An array of user workflows or applications mentioned (e.g. ["Software Development", "Gaming"]).

Respond ONLY with valid JSON and nothing else. No markdown fences.`;

    const result = await this.generate(prompt, 'You are an autonomous e-commerce discovery agent. Output pure JSON.');
    if (result && result.text) {
      try {
        const cleaned = result.text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.interpretedRequirement) {
          return {
            interpretedRequirement: parsed.interpretedRequirement,
            budget: typeof parsed.budget === 'number' ? parsed.budget : null,
            extractedFeatures: Array.isArray(parsed.extractedFeatures) ? parsed.extractedFeatures : [],
            useCases: Array.isArray(parsed.useCases) ? parsed.useCases : [],
            source: 'GEMINI_FLASH_3.5_AGENT'
          };
        }
      } catch (jsonErr) {
      }
    }

    return this.synthesizeIntentDynamically(query);
  }

  static synthesizeIntentDynamically(query) {
    const clean = (query || '').trim();
    const words = clean.split(/\s+/).filter(w => w.length > 2);

    let budget = null;
    const budgetMatch = clean.match(/(?:under|below|less than|budget(?: of)?|max|up to|\$)\s*\$?(\d+(?:\.\d+)?)/i);
    if (budgetMatch) {
      budget = parseFloat(budgetMatch[1]);
    }

    const extractedFeatures = [];
    const useCases = [];

    const featureTokens = {
      'ram': '16GB+ RAM',
      'memory': '16GB+ RAM',
      'ssd': 'High-Speed NVMe SSD',
      'storage': 'Fast Storage',
      'gpu': 'Dedicated Graphics',
      'rtx': 'NVIDIA RTX Acceleration',
      'display': 'High-Resolution Display',
      'screen': 'Retina / OLED Display',
      'battery': 'All-Day Battery Life',
      'lightweight': 'Ultra-Portable Form Factor',
      'cpu': 'Multi-Core Processor',
      'processor': 'High-Performance Processor',
      'audio': 'Spatial Audio',
      'sound': 'Hi-Res Audio',
      'noise': 'Active Noise Cancellation'
    };

    const useCaseTokens = {
      'coding': 'Software Development',
      'programming': 'Programming & Compiling',
      'java': 'Java Development',
      'python': 'Python Development',
      'ai': 'AI / ML Workloads',
      'ml': 'Machine Learning',
      'deep learning': 'Deep Learning',
      'data': 'Data Science',
      'gaming': 'AAA Gaming',
      'game': 'Gaming',
      'design': 'Creative Design & CAD',
      'video': 'Video Production',
      'photo': 'Photo Editing',
      'office': 'Productivity & Office Work',
      'school': 'Academic & Study Work',
      'student': 'Student Productivity',
      'business': 'Enterprise Workflows',
      'travel': 'Travel & Remote Work'
    };

    const queryLower = clean.toLowerCase();

    for (const [key, feature] of Object.entries(featureTokens)) {
      if (queryLower.includes(key) && !extractedFeatures.includes(feature)) {
        extractedFeatures.push(feature);
      }
    }

    for (const [key, uc] of Object.entries(useCaseTokens)) {
      if (queryLower.includes(key) && !useCases.includes(uc)) {
        useCases.push(uc);
      }
    }

    if (queryLower.includes('java') || queryLower.includes('ai') || queryLower.includes('ml') || queryLower.includes('develop') || queryLower.includes('coding') || queryLower.includes('programming')) {
      if (!extractedFeatures.includes('16GB+ RAM')) {
        extractedFeatures.unshift('16GB+ RAM');
      }
    }

    if (extractedFeatures.length === 0) {
      extractedFeatures.push('Multi-core processor', 'Fast NVMe SSD');
    }

    let requirementSentence = '';
    if (useCases.length > 0) {
      requirementSentence = `High-performance configuration engineered for ${useCases.join(' and ')}`;
    } else if (extractedFeatures.length > 0) {
      requirementSentence = `Device featuring ${extractedFeatures.join(', ')}`;
    } else {
      requirementSentence = `Hardware optimized for ${clean}`;
    }

    if (budget) {
      requirementSentence += ` within $${budget} budget`;
    }

    return {
      interpretedRequirement: requirementSentence,
      budget,
      extractedFeatures,
      useCases,
      source: 'DYNAMIC_NLP_AGENT'
    };
  }

  static async synthesizePolicyAnswer(question, chunkContent, docTitle, section) {
    const systemInstruction = `You are the ShopSmart Enterprise Policy Assistant powered by Gemini Flash 3.5.
ZERO-HALLUCINATION ENFORCEMENT:
Your job is to answer the customer's question strictly using the provided verified policy documentation context.
- Be concise, accurate, and direct (1-3 sentences).
- If the policy context does not state the answer, reply: "I do not have sufficient verified policy documentation to answer that question with 100% confidence. Please contact our customer support team at support@shopsmart.ai for personalized assistance."
- Never speculate or invent policies not present in the context.`;

    const prompt = `VERIFIED POLICY DOCUMENTATION:
[${docTitle} — ${section}]
${chunkContent}

CUSTOMER QUESTION:
${question}

ANSWER:`;

    const result = await this.generate(prompt, systemInstruction);
    if (result && result.text) {
      return {
        answer: result.text.trim(),
        model: result.model,
        source: 'GEMINI_FLASH_3.5_AGENT'
      };
    }

    const dynamicAnswer = this.extractAnswerFromContext(question, chunkContent, docTitle);
    return {
      answer: dynamicAnswer,
      model: this.getModel(),
      source: 'DYNAMIC_RAG_SYNTHESIS'
    };
  }

  static extractAnswerFromContext(question, chunkContent, docTitle, contextualQuery = '') {
    if (!chunkContent || typeof chunkContent !== 'string') {
      return "I do not have sufficient verified policy documentation to answer that question with 100% confidence. Please contact our corporate customer support team at support@shopsmart.ai.";
    }

    const combinedQuery = `${question} ${contextualQuery}`.trim();
    const questionTokens = combinedQuery.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['what', 'when', 'where', 'how', 'can', 'the', 'and', 'for', 'with', 'does', 'about'].includes(w));

    const cleanedContent = chunkContent.replace(/^#{1,6}\s+[^\n]+/gm, ' ');

    const sentences = cleanedContent
      .replace(/[\n\r]+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && !s.startsWith('#'));

    const scoredSentences = sentences.map(sentence => {
      const sentenceLower = sentence.toLowerCase();
      let matchCount = 0;
      for (const token of questionTokens) {
        if (sentenceLower.includes(token)) {
          matchCount += 1;
        }
      }
      return { sentence, score: matchCount };
    });

    scoredSentences.sort((a, b) => b.score - a.score);

    const relevantSentences = scoredSentences
      .filter(s => s.score > 0)
      .slice(0, 2)
      .map(s => s.sentence);

    if (relevantSentences.length > 0) {
      return relevantSentences.join(' ');
    }

    const firstSubstantive = sentences.find(s => s.length > 30) || sentences[0];
    return firstSubstantive || `Refer to verified terms in ${docTitle}.`;
  }
}
