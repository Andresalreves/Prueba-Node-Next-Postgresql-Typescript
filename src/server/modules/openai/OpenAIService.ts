import OpenAI from 'openai';
import { env } from '@/utils/env'; // Usamos un util para cargar envs

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export class OpenAIService {
    
  /**
   * Genera una respuesta de texto usando GPT-5
   * Usa la nueva API de responses.create() según documentación oficial de OpenAI
   * Separa las instrucciones del input del usuario para mejor rendimiento
   */
  public async generateCopy(userMessage: string): Promise<string> {
    try {
      // Usar GPT-5 con la nueva API responses.create()
      // Según la documentación oficial: usar 'instructions' + 'input' + 'reasoning'
      const response = await (openai as any).responses.create({
        model: "gpt-5",
        reasoning: { effort: "low" }, // Recomendado para GPT-5
        instructions: "Eres un asistente de chatbot para una página de Facebook. Genera una respuesta corta, amigable y que incite a la interacción.",
        input: userMessage,
      });
      
      return response.output_text?.trim() ?? "Lo siento, no pude generar una respuesta.";
    } catch (error: any) {
      // Fallback a GPT-4o-mini si GPT-5 no está disponible
      console.warn('GPT-5 no disponible, usando GPT-4o-mini como fallback:', error.message);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un asistente de chatbot para una página de Facebook. Genera una respuesta corta, amigable y que incite a la interacción." },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 100,
      });
      
      return response.choices[0].message.content?.trim() ?? "Lo siento, no pude generar una respuesta.";
    }
  }

  /**
   * Método directo para usar GPT-5 con máximo control
   * Útil para casos de uso específicos donde se necesita personalización
   * Usa reasoning effort 'medium' para balance entre velocidad y calidad
   */
  public async generateWithGPT5(input: string, effort: 'low' | 'medium' | 'high' = 'medium'): Promise<string> {
    const response = await (openai as any).responses.create({
      model: "gpt-5",
      reasoning: { effort }, // Control de esfuerzo de razonamiento
      input: input,
    });
    
    return response.output_text?.trim() ?? '';
  }

  /**
   * Genera respuestas más largas y detalladas con GPT-5
   * Ideal para contenido de marketing o descripciones extensas
   * Usa 'medium' effort para mejor calidad en respuestas complejas
   */
  public async generateDetailedCopy(userMessage: string): Promise<string> {
    try {
      const response = await (openai as any).responses.create({
        model: "gpt-5",
        reasoning: { effort: "medium" }, // Mayor esfuerzo para respuestas detalladas
        instructions: "Eres un experto en marketing conversacional y copywriting. La respuesta debe ser profesional pero cercana, incentivar la interacción y ofrecer valor.",
        input: `Crea una respuesta detallada, persuasiva y amigable para el siguiente mensaje de un usuario en Facebook Messenger: "${userMessage}"`,
      });
      
      return response.output_text?.trim() ?? "Lo siento, no pude generar una respuesta.";
    } catch (error: any) {
      console.warn('Error con GPT-5, usando fallback:', error.message);
      
      // Fallback a GPT-4o-mini
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un experto en marketing conversacional. Crea respuestas detalladas, persuasivas y amigables." },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 300,
      });
      
      return response.choices[0].message.content?.trim() ?? "Lo siento, no pude generar una respuesta.";
    }
  }

  public async generateImage(prompt: string): Promise<string> {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Estilo abstracto, minimalista, logotipo de marca para una respuesta de chatbot: ${prompt}`,
      n: 1,
      size: "1024x1024", // DALL-E 3 solo soporta: 1024x1024, 1024x1792, 1792x1024
      response_format: "url",
    });
    return response.data?.[0]?.url ?? '';
  }
}