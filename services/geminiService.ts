
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult, Award, AwardDocument } from "../types";

// Note: In a real production app, this key should be proxied via a backend.
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const isApiConfigured = () => !!apiKey;

export const matchAwardWithGemini = async (
  jobTitle: string, 
  jobDescription: string, 
  industry: string
): Promise<AIAnalysisResult> => {
  
  if (!ai) throw new Error("API Key not configured");

  // Define schema for structured JSON output
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      matches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            awardCode: { type: Type.STRING },
            awardName: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "A number between 0 and 100" },
            reasoning: { type: Type.STRING },
            suggestedClassification: { type: Type.STRING }
          },
          required: ["awardCode", "awardName", "confidence", "reasoning", "suggestedClassification"]
        }
      }
    },
    required: ["matches"]
  };

  const prompt = `
    You are an expert in Australian Modern Awards (Fair Work).
    Analyze the following job details and identify the most likely Australian Modern Award and Classification.
    
    Job Title: ${jobTitle}
    Industry Hint: ${industry}
    Description: ${jobDescription}

    Consider standard awards like General Retail (MA000004), Hospitality (MA000009), Clerks (MA000002), etc.
    Return the top 3 matches.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1 // Low temperature for factual accuracy
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Match Error:", error);
    throw error;
  }
};

export const findOfficialDocuments = async (query: string): Promise<AwardDocument[]> => {
  if (!ai) throw new Error("API Key not configured");

  const prompt = `
    Find the official Fair Work Ombudsman Pay Guide PDF for: "${query}".
    Focus on finding definitive PDF documents from fairwork.gov.au.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
        // Note: Do NOT use responseMimeType: "application/json" with googleSearch tool as the response is text + metadata
      }
    });

    // Extract URLs from grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Map chunks to AwardDocument structure
    // We prioritize chunks that look like PDF links or official pages
    const documents: AwardDocument[] = chunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        description: "Found via Live Search",
        source: 'search' as const
      }));

    // Simple deduplication based on URL
    const uniqueDocs = Array.from(new Map(documents.map(item => [item.url, item])).values());
    
    return uniqueDocs;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};

export const askAssistant = async (question: string, knowledgeBase?: Award[], context?: string): Promise<string> => {
  if (!ai) throw new Error("API Key not configured");

  let kbString = "";
  if (knowledgeBase && knowledgeBase.length > 0) {
      kbString = "CURRENT KNOWN AWARDS & RULES:\n";
      knowledgeBase.forEach(award => {
          kbString += `Award: ${award.name} (${award.code})\n`;
          kbString += `  - Penalties: Sat x${award.penaltyRates?.saturday}, Sun x${award.penaltyRates?.sunday}, PH x${award.penaltyRates?.publicHoliday}\n`;
          if (award.allowances && award.allowances.length > 0) {
             kbString += `  - Allowances: ${award.allowances.map(a => `${a.name} ($${a.amount})`).join(', ')}\n`;
          }
          if (award.classifications.length > 0) {
              kbString += `  - Example Rate: ${award.classifications[0].title} = $${award.classifications[0].baseRate}/hr\n`;
          }
          kbString += "\n";
      });
  }

  const prompt = `
    You are a helpful Australian Payroll Assistant. 
    Answer the user's question about pay rates, awards, or conditions.
    
    ${kbString}

    User Question: ${question}
    ${context ? `Context from current calculation: ${context}` : ''}

    Instructions:
    1. If the user's question relates to one of the KNOWN AWARDS above, cite specific rates, allowances, or penalties from the data provided.
    2. If the data is not in the knowledge base, refer to Fair Work general principles but mention you don't have that specific award loaded yet.
    3. Keep the answer concise, friendly, and refer to Fair Work Australia principles generally.
    4. Do not give binding legal advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Sorry, I encountered an error communicating with the AI service.";
  }
};

export const ingestAward = async (content: string, mimeType: string = 'text/plain'): Promise<Award> => {
   if (!ai) throw new Error("API Key not configured");

   const schema: Schema = {
    type: Type.OBJECT,
    properties: {
        code: { type: Type.STRING, description: "The MA code, e.g., MA000004" },
        name: { type: Type.STRING },
        industry: { type: Type.STRING },
        penaltyRates: {
            type: Type.OBJECT,
            properties: {
                saturday: { type: Type.NUMBER },
                sunday: { type: Type.NUMBER },
                publicHoliday: { type: Type.NUMBER },
                overtime: { type: Type.NUMBER },
                nightShift: { type: Type.NUMBER }
            },
            required: ["saturday", "sunday", "publicHoliday", "overtime", "nightShift"]
        },
        classifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    baseRate: { type: Type.NUMBER },
                    casualLoading: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                },
                required: ["id", "title", "baseRate", "casualLoading"]
            }
        },
        allowances: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER, description: "The dollar amount or hourly rate for the allowance" }
                },
                required: ["name", "amount"]
            }
        }
    },
    required: ["code", "name", "industry", "penaltyRates", "classifications"]
   };

   const instruction = `
    Analyze the provided Australian Award document (Pay Guide). 
    Extract the key rules into a structured format.
    
    Specifically extract:
    1. The Award Code and Name.
    2. The Penalty Rate multipliers for Saturday, Sunday, Public Holiday, Overtime, and Night Shift (e.g., 150% = 1.5).
    3. A list of key Classifications with their hourly Base Rates.
    4. A list of common monetary Allowances (e.g., Tool Allowance, Laundry Allowance, Meal Allowance) and their dollar amounts.
    
    If content is base64 PDF, OCR and parse it.
   `;

   const parts = [];
   if (mimeType === 'text/plain') {
       parts.push({ text: instruction + "\nText Content:\n" + content.substring(0, 15000) });
   } else {
       parts.push({ text: instruction });
       parts.push({
           inlineData: {
               mimeType: mimeType,
               data: content
           }
       });
   }

    try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
          responseMimeType: "application/json",
          responseSchema: schema
      }
    });
    const textRes = response.text;
    if(!textRes) throw new Error("Could not parse award data.");
    return JSON.parse(textRes) as Award;
  } catch (error) {
    console.error("Gemini Ingestion Error:", error);
    throw error;
  }
}
