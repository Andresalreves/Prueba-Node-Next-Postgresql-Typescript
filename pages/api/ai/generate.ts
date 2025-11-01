import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '@/server/modules/openai/OpenAIService';

const openaiService = new OpenAIService();

/**
 * API endpoint para generar contenido con IA
 * POST /api/ai/generate
 * Body: { prompt: string, generateImage?: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { prompt, generateImage = false } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'El prompt es requerido' });
      }

      // Generar copy con IA
      const copy = await openaiService.generateCopy(prompt);

      let image: string | undefined;

      // Generar imagen si se solicita
      if (generateImage) {
        try {
          image = await openaiService.generateImage(prompt);
        } catch (error) {
          console.error('Error al generar imagen:', error);
          // Continuar aunque falle la imagen
        }
      }

      return res.status(200).json({
        success: true,
        copy,
        image: image || null
      });

    } catch (error) {
      console.error('Error al generar contenido con IA:', error);
      return res.status(500).json({ error: 'Error al generar contenido con IA' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
