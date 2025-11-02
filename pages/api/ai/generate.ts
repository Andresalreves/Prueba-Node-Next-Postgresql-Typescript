import { NextApiRequest, NextApiResponse } from 'next';
import { AIService } from '@/server/modules/ai/AIService';

const aiService = new AIService();

/**
 * API endpoint para generar contenido con IA
 * POST /api/ai/generate
 * Body: { prompt: string, generateImage?: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { prompt, generateImage = true } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'El prompt es requerido' });
      }

      // Generar copy con IA
      const copy = await aiService.generateCopy(prompt);

      let image: string | undefined;

      // Generar o describir imagen según el proveedor
      if (generateImage) {
        try {
          image = await aiService.generateImage(prompt);
        } catch (error) {
          console.error('Error al generar imagen:', error);
          // Continuar aunque falle
        }
      }

      // Determinar si es imagen real o descripción
      const isImageReal = image && (image.startsWith('http') || image.startsWith('data:image'));
      
      return res.status(200).json({
        success: true,
        copy,
        image: image || null,
        isImageDescription: generateImage && !isImageReal // Es descripción solo si no es imagen real
      });

    } catch (error) {
      console.error('Error al generar contenido con IA:', error);
      return res.status(500).json({ error: 'Error al generar contenido con IA' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
