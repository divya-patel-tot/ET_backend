import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface ExtractedExpense {
  amount: number | null;
  category:
    | 'Food'
    | 'Transport'
    | 'Shopping'
    | 'Health'
    | 'Entertainment'
    | 'Bills'
    | 'Other'
    | null;
  date: string | null;
  note: string | null;
}

export const extractExpenseFromText = async (
  userInput: string
): Promise<ExtractedExpense> => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Extract expense details from the following text and return ONLY a valid JSON object with keys: amount (number), category (one of: Food, Transport, Shopping, Health, Entertainment, Bills, Other), date (ISO string or null), note (short summary string). Text: "${userInput}"`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/, '')
    .trim();

  const parsed = JSON.parse(cleaned) as ExtractedExpense;

  const validCategories = [
    'Food',
    'Transport',
    'Shopping',
    'Health',
    'Entertainment',
    'Bills',
    'Other',
  ];

  return {
    amount: typeof parsed.amount === 'number' ? parsed.amount : null,
    category: validCategories.includes(parsed.category as string)
      ? (parsed.category as ExtractedExpense['category'])
      : 'Other',
    date: parsed.date || null,
    note: parsed.note || null,
  };
};
