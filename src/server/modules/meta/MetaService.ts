import axios from 'axios';
import { env } from '@/utils/env';

// Constantes para la API de Meta (Usando versión más reciente)
const META_API_URL = `https://graph.facebook.com/v24.0/me/messages`;

export class MetaService {
  private readonly PAGE_ACCESS_TOKEN = env.META_PAGE_TOKEN;

  // 1️⃣ Manejo de la Solicitud GET de Verificación del Webhook
  public verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const VERIFY_TOKEN = env.META_VERIFY_TOKEN;
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Éxito: Retorna el desafío
      return challenge;
    }
    // Fallo: Devuelve nulo para error 403
    return null;
  }

  // 3️⃣ Envío de Mensaje de Salida (Outbound Message)
  public async sendOutboundMessage(userId: string, text: string, imageUrl?: string): Promise<boolean> {
    // Validar que tenemos el token
    if (!this.PAGE_ACCESS_TOKEN) {
      console.error('❌ [META] PAGE_ACCESS_TOKEN no configurado');
      return false;
    }

    try {
      // Enviar mensaje de texto
      const textPayload = {
        recipient: { id: userId },
        messaging_type: "RESPONSE", // REQUERIDO por la documentación de Meta
        message: { text: text }
      };

      const textResponse = await axios.post(
        `${META_API_URL}?access_token=${this.PAGE_ACCESS_TOKEN}`,
        textPayload
      );

      console.log(`✅ [META] Mensaje de texto enviado a ${userId}`);
      console.log(`   Message ID: ${textResponse.data.message_id}`);

      // Si hay imagen, enviarla como mensaje separado
      if (imageUrl) {
        const imagePayload = {
          recipient: { id: userId },
          messaging_type: "RESPONSE",
          message: {
            attachment: {
              type: "image",
              payload: { 
                url: imageUrl, 
                is_reusable: true 
              }
            }
          }
        };

        const imageResponse = await axios.post(
          `${META_API_URL}?access_token=${this.PAGE_ACCESS_TOKEN}`,
          imagePayload
        );

        console.log(`✅ [META] Imagen enviada a ${userId}`);
        console.log(`   Message ID: ${imageResponse.data.message_id}`);
      }

      return true;

    } catch (error: any) {
      console.error('❌ [META] Error al enviar mensaje:');
      console.error('  UserId:', userId);
      console.error('  Status:', error.response?.status);
      console.error('  Error:', error.response?.data?.error || error.message);
      return false;
    }
  }
}