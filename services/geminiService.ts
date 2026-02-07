const GEMINI_API_KEY = 'AIzaSyD1wEIkp50ET4dpvO2g85amQK_VZUR2O2c';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const analyzeProductImage = async (base64Image: string): Promise<{
  productName: string;
  estimatedPrice: number;
  category: string;
} | null> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            },
            {
              text: 'Identify the product in this image. Estimate its price in USD as a number. Suggest a spending category (e.g., Electronics, Clothing, Food, Entertainment). Return ONLY valid JSON with no markdown: {"productName":"string","estimatedPrice":number,"category":"string"}'
            }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) return null;
    
    // Parse JSON, handling potential markdown wrapping
    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) return null;
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing product:', error);
    return null;
  }
};

export const getImpulseAdvice = async (product: string, price: number, hourlyRate: number): Promise<string> => {
  try {
    const hours = (price / hourlyRate).toFixed(1);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `The user wants to buy "${product}" for $${price}. They earn $${hourlyRate}/hr, so this costs them ${hours} hours of work. Give a short, 1-sentence reflection prompt to help them decide if they really need it now. Be supportive, not preachy.`
          }]
        }]
      })
    });

    if (!response.ok) {
      return "Take a moment to think about whether you really need this.";
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Consider if this aligns with your goals.";
  } catch (error) {
    console.error('Error getting impulse advice:', error);
    return "Take a moment to think about your purchase.";
  }
};

// Calculate work hours needed to pay off purchase (based on 8-hour workday)
export const calculateWorkHours = (price: number, hourlyRate: number): { hours: number; minutes: number } => {
  const totalHours = price / hourlyRate;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  return { hours, minutes };
};

// Calculate investment potential (10% annual return over 5 years)
export const calculateInvestmentValue = (price: number, years: number = 5): number => {
  const annualReturn = 0.10;
  return Math.round(price * Math.pow(1 + annualReturn, years));
};
