import { z } from 'zod';
import { parseStudentRequest } from '../ai/geminiService.js';

const parseSchema = z.object({
  prompt: z.string().min(1, 'Prompt text is required')
});

export async function parseRequest(req, res) {
  try {
    const parsed = parseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prompt input',
        errors: parsed.error.errors
      });
    }

    const aiResult = await parseStudentRequest(parsed.data.prompt);
    return res.json({
      success: true,
      data: aiResult
    });
  } catch (err) {
    console.error('AI parse controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI understanding'
    });
  }
}
