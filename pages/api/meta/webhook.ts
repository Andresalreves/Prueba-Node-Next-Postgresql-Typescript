import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIService } from '@/server/modules/openai/OpenAIService';
import { MetaService } from '@/server/modules/meta/MetaService';
import { LogService } from '@/server/modules/logs/LogService';

const metaService = new MetaService();
const openaiService = new OpenAIService();
const logService = new LogService();

// Lógica de orquestación centralizada
const handleInboundMessage = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;

  // Verificar que sea un webhook de página (requerido por Meta)
  if (body.object !== 'page') {
    return res.status(404).send('Not Found');
  }

  console.log('🔔 Received webhook:');
  console.dir(body, { depth: null });

  const entry = body.entry[0];
  const messagingEvent = entry.messaging[0];
  
  // Verificar que exista el evento de mensaje
  if (!messagingEvent || !messagingEvent.message) {
    return res.status(200).send('EVENT_RECEIVED');
  }

  const userId = messagingEvent.sender.id;
  const inboundMessage = messagingEvent.message.text;

  console.log('\n🔔 ===== NUEVO MENSAJE RECIBIDO =====');
  console.log(`👤 Usuario: ${userId}`);
  console.log(`💬 Mensaje: "${inboundMessage}"`);

  // Si no hay texto (puede ser imagen, sticker, etc), responder y salir
  if (!inboundMessage) {
    console.log('⚠️ Mensaje sin texto (posiblemente imagen o sticker)');
    return res.status(200).send('EVENT_RECEIVED');
  }

  const logId = await logService.createLog(userId, inboundMessage);
  console.log(`📝 Log creado: ${logId}`);

  try {
    console.log('🤖 Generando respuesta con GPT-5...');
    const aiCopy = await openaiService.generateCopy(inboundMessage);
    console.log(`✨ IA generó: "${aiCopy}"`);

    // Opcional: Generar Imagen (se puede hacer en paralelo)
    // const aiImage = await openaiService.generateImage(aiCopy);

    // Enviar Respuesta Automática (Outbound Message)
    console.log('📤 Enviando respuesta a Facebook...');
    const sent = await metaService.sendOutboundMessage(userId, aiCopy);
    
    if (sent) {
      console.log('✅ Mensaje enviado exitosamente');
    } else {
      console.log('❌ Fallo al enviar mensaje');
    }

    // Actualiza el registro con los resultados
    await logService.updateLogStatus(logId, sent ? "SENT" : "FAILED", aiCopy /* , aiImage */);
    console.log('📊 Log actualizado en la base de datos');
    console.log('===== FIN DEL PROCESO =====\n');

    // Responder con EVENT_RECEIVED como requiere Meta
    return res.status(200).send('EVENT_RECEIVED');

  } catch (error) {
    console.error('❌ Error en el flujo del chatbot:', error);
    await logService.updateLogStatus(logId, "FAILED", "Error interno");
    // Siempre responder 200 para que Meta no reintente
    return res.status(200).send('EVENT_RECEIVED');
  }
};

// Punto de entrada del API Route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Validación del Webhook
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    const challengeResponse = metaService.verifyWebhook(mode as string, token as string, challenge as string);

    if (challengeResponse) {
      return res.status(200).send(challengeResponse);
    } else {
      // Siempre devolver 403 si la validación falla por seguridad
      return res.status(403).end();
    }

  } else if (req.method === 'POST') {
    // Recepción del Webhook (Inbound Message)
    return handleInboundMessage(req, res);
  }

  // Rechazo de otros métodos HTTP (Buena Práctica)
  return res.status(405).end();
}