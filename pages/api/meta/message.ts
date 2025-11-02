import { NextApiRequest, NextApiResponse } from 'next';
import { MetaService } from '@/server/modules/meta/MetaService';
import { AIService } from '@/server/modules/ai/AIService';
import { LogService } from '@/server/modules/logs/LogService';

const metaService = new MetaService();
const aiService = new AIService();
const logService = new LogService();

/**
 * API endpoint para enviar mensajes manuales
 * POST /api/meta/message
 * Body: { userId: string, text: string, generateAI?: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, text, generateAI = false } = req.body;

      if (!userId || !text) {
        return res.status(400).json({ error: 'userId y text son requeridos' });
      }

      // Crear log del mensaje
      const logId = await logService.createLog(userId, `[Manual] ${text}`);

      let finalText = text;
      
      // Si se solicita generar con IA
      if (generateAI) {
        finalText = await aiService.generateCopy(text);
      }

      // Enviar mensaje a través de Meta
      const sent = await metaService.sendOutboundMessage(userId, finalText);
      
      console.log(`[MESSAGE] UserId: ${userId}, Sent: ${sent}, GenerateAI: ${generateAI}`);
      if (generateAI) {
        console.log(`[MESSAGE] AI Generated: ${finalText}`);
      }

      // Actualizar log
      await logService.updateLogStatus(
        logId,
        sent ? 'SENT' : 'FAILED',
        generateAI ? finalText : undefined
      );

      return res.status(200).json({
        success: sent,
        message: sent ? 'Mensaje enviado correctamente' : 'Error al enviar mensaje',
        aiCopy: generateAI ? finalText : undefined
      });

    } catch (error) {
      console.error('Error al enviar mensaje manual:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
