import { Request, Response } from 'express';
import { extractExpenseFromText } from '../utils/gemini';

export const extractExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body as { text?: string };

    if (!text || text.trim().length === 0) {
      res.status(400).json({ message: 'Text input is required' });
      return;
    }

    if (text.length > 2000) {
      res.status(400).json({ message: 'Input text is too long (max 2000 characters)' });
      return;
    }

    const extracted = await extractExpenseFromText(text);
    res.status(200).json({ extracted });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[AI Extract Error]', error.message);

    if (error.message.includes('GEMINI_API_KEY')) {
      res.status(503).json({
        message: 'AI service is not configured. Please set GEMINI_API_KEY.',
        extracted: null,
      });
      return;
    }

    if (error.message.includes('JSON')) {
      res.status(422).json({
        message: 'AI could not parse structured data from the provided text.',
        extracted: null,
      });
      return;
    }

    res.status(500).json({
      message: 'AI extraction failed. Please try again or fill manually.',
      extracted: null,
    });
  }
};
