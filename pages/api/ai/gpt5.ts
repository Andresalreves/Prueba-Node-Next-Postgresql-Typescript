import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '@/server/modules/openai/OpenAIService';

const openaiService = new OpenAIService();

/**
 * API endpoint para probar GPT-5 directamente
 * POST /api/ai/gpt5
 * Body: { input: string, detailed?: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { input, detailed = false } = req.body;

      if (!input) {
        return res.status(400).json({ error: 'El campo input es requerido' });
      }

      let result: string;

      if (detailed) {
        // Usar el método para respuestas detalladas
        result = await openaiService.generateDetailedCopy(input);
      } else {
        // Usar el método directo de GPT-5
        result = await openaiService.generateWithGPT5(input);
      }

      return res.status(200).json({
        success: true,
        model: 'gpt-5',
        output: result,
        detailed: detailed
      });

    } catch (error: any) {
      console.error('Error al usar GPT-5:', error);
      return res.status(500).json({ 
        error: 'Error al generar contenido con GPT-5',
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
