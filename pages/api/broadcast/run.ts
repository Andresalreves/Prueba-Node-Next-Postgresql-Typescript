import { NextApiRequest, NextApiResponse } from 'next';
import { MetaService } from '@/server/modules/meta/MetaService';
import { OpenAIService } from '@/server/modules/openai/OpenAIService';
import { LogService } from '@/server/modules/logs/LogService';

const metaService = new MetaService();
const openaiService = new OpenAIService();
const logService = new LogService();

/**
 * API endpoint para ejecutar broadcasts
 * POST /api/broadcast/run
 * Body: { userIds: string[], text: string, generateAI?: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userIds, text, generateAI = false } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'userIds debe ser un array no vacío' });
      }

      if (!text) {
        return res.status(400).json({ error: 'text es requerido' });
      }

      let finalText = text;

      // Generar copy con IA si se solicita
      if (generateAI) {
        finalText = await openaiService.generateCopy(text);
      }

      const results = [];

      // Enviar mensaje a cada usuario
      for (const userId of userIds) {
        try {
          // Crear log
          const logId = await logService.createLog(userId, `[Broadcast] ${text}`);

          // Enviar mensaje
          const sent = await metaService.sendOutboundMessage(userId, finalText);

          // Actualizar log
          await logService.updateLogStatus(
            logId,
            sent ? 'SENT' : 'FAILED',
            generateAI ? finalText : undefined
          );

          results.push({
            userId,
            success: sent
          });

          // Esperar un poco entre mensajes para evitar límites de tasa
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error al enviar a usuario ${userId}:`, error);
          results.push({
            userId,
            success: false,
            error: 'Error al enviar mensaje'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;

      return res.status(200).json({
        success: true,
        totalSent: successCount,
        totalFailed: results.length - successCount,
        results
      });

    } catch (error) {
      console.error('Error al ejecutar broadcast:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
