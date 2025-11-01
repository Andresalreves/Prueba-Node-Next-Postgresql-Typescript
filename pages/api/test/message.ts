import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '@/server/modules/openai/OpenAIService';
import { LogService } from '@/server/modules/logs/LogService';

const openaiService = new OpenAIService();
const logService = new LogService();

/**
 * API endpoint de prueba para verificar IA sin necesidad de Meta
 * POST /api/test/message
 * Body: { text: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'El campo text es requerido' });
      }
      
      // Simular userId único para cada prueba
      const userId = 'TEST_USER_' + Date.now();
      
      console.log(`[TEST] Iniciando prueba con texto: "${text}"`);
      
      // Crear log
      const logId = await logService.createLog(userId, `[Test] ${text}`);
      console.log(`[TEST] Log creado con ID: ${logId}`);
      
      // Generar con IA
      console.log(`[TEST] Generando respuesta con IA...`);
      const aiResponse = await openaiService.generateCopy(text);
      console.log(`[TEST] IA generó: "${aiResponse}"`);
      
      // Actualizar log como SENT (simulado, sin envío real a Meta)
      await logService.updateLogStatus(logId, 'SENT', aiResponse);
      console.log(`[TEST] Log actualizado exitosamente`);
      
      return res.status(200).json({
        success: true,
        userId: userId,
        logId: logId,
        originalText: text,
        aiResponse: aiResponse,
        note: '✅ Prueba completada exitosamente (sin envío real a Meta)'
      });
      
    } catch (error: any) {
      console.error('❌ [TEST] Error en prueba:', error);
      return res.status(500).json({ 
        error: 'Error en la prueba',
        details: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Método no permitido' });
}
