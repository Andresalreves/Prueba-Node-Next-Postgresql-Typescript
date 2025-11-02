import Groq from 'groq-sdk';
import { env } from '@/utils/env';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * Servicio para integración con Groq API
 * Groq ofrece inferencia rápida y baja latencia
 */
export class GroqService {
  
  /**
   * Genera una respuesta de texto usando Llama 3.3 70B
   * Modelo rápido y eficiente para chatbot
   */
  public async generateCopy(userMessage: string): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un asistente de chatbot para una página de Facebook. Genera una respuesta corta, amigable y que incite a la interacción."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        model: "llama-3.3-70b-versatile", // Modelo versátil de 70B parámetros
        temperature: 0.7,
        max_completion_tokens: 150,
        top_p: 1,
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || "Lo siento, no pude generar una respuesta.";
    } catch (error: any) {
      console.error('❌ [GROQ] Error al generar copy:', error.message);
      throw error;
    }
  }

  /**
   * Genera respuestas más detalladas con Llama 3.3 70B
   * Ideal para contenido de marketing o descripciones extensas
   */
  public async generateDetailedCopy(userMessage: string): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un experto en marketing conversacional y copywriting. La respuesta debe ser profesional pero cercana, incentivar la interacción y ofrecer valor."
          },
          {
            role: "user",
            content: `Crea una respuesta detallada, persuasiva y amigable para el siguiente mensaje de un usuario en Facebook Messenger: "${userMessage}"`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.8,
        max_completion_tokens: 500,
        top_p: 1,
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || "Lo siento, no pude generar una respuesta.";
    } catch (error: any) {
      console.error('❌ [GROQ] Error al generar copy detallado:', error.message);
      throw error;
    }
  }

  /**
   * Analiza una imagen y genera descripción o responde preguntas
   * Usa Llama 4 Scout (multimodal)
   * @param imageUrl URL de la imagen a analizar
   * @param prompt Pregunta o instrucción sobre la imagen
   */
  public async analyzeImage(imageUrl: string, prompt: string = "Describe esta imagen en detalle"): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // Modelo multimodal
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || "No pude analizar la imagen.";
    } catch (error: any) {
      console.error('❌ [GROQ] Error al analizar imagen:', error.message);
      throw error;
    }
  }

  /**
   * Genera una "imagen" conceptual (descripción detallada)
   * Nota: Groq no genera imágenes reales como DALL-E, pero puede crear descripciones muy detalladas
   * que pueden usarse con otros servicios de generación de imágenes
   */
  public async generateImageDescription(prompt: string): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un experto en describir imágenes de forma extremadamente detallada y visual. Crea una descripción que pueda usarse para generar una imagen con IA."
          },
          {
            role: "user",
            content: `Crea una descripción ultra detallada y visual para generar esta imagen: "${prompt}". Incluye colores, estilo, composición, iluminación y detalles específicos.`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
        max_completion_tokens: 300,
        top_p: 1,
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || "No pude generar la descripción.";
    } catch (error: any) {
      console.error('❌ [GROQ] Error al generar descripción de imagen:', error.message);
      throw error;
    }
  }

  /**
   * Genera respuestas en formato JSON estructurado
   * Útil para extraer información de forma estructurada
   */
  public async generateJSON(userMessage: string, instruction: string): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: instruction
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_completion_tokens: 500,
        top_p: 1,
        response_format: { type: "json_object" }, // Forzar respuesta en JSON
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || "{}";
    } catch (error: any) {
      console.error('❌ [GROQ] Error al generar JSON:', error.message);
      throw error;
    }
  }

  /**
   * Conversación multi-turn (mantiene contexto)
   * @param messages Array de mensajes previos
   */
  public async continueConversation(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_completion_tokens: 300,
        top_p: 1,
      });

      return chatCompletion.choices[0]?.message?.content?.trim() || "Lo siento, no pude continuar la conversación.";
    } catch (error: any) {
      console.error('❌ [GROQ] Error en conversación multi-turn:', error.message);
      throw error;
    }
  }

  /**
   * Verifica la disponibilidad del servicio
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3.3-70b-versatile",
        max_completion_tokens: 10,
      });
      return !!response.choices[0]?.message?.content;
    } catch (error) {
      return false;
    }
  }
}
