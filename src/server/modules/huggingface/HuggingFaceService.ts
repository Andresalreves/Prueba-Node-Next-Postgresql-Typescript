import { HfInference } from '@huggingface/inference';
import { env } from '@/utils/env';

/**
 * Servicio para integración con Hugging Face Inference API
 * Utiliza Stable Diffusion para generación de imágenes
 */
export class HuggingFaceService {
  private client: HfInference;

  constructor() {
    if (!env.HF_TOKEN) {
      throw new Error('HF_TOKEN no está configurado en las variables de entorno');
    }
    this.client = new HfInference(env.HF_TOKEN);
    console.log('🎨 [HUGGING FACE] Servicio inicializado con Stable Diffusion');
  }

  /**
   * Genera una imagen usando Stable Diffusion
   * @param prompt Descripción de la imagen a generar
   * @returns URL de la imagen generada en formato base64
   */
  public async generateImage(prompt: string): Promise<string> {
    // Configuraciones de modelos con sus providers según documentación oficial
    const modelConfigs = [
      {
        provider: 'nscale' as const,
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        steps: 5
      },
      {
        provider: 'together' as const,
        model: 'black-forest-labs/FLUX.1-schnell',
        steps: 4
      },
      {
        provider: 'fal-ai' as const,
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        steps: 5
      },
    ];

    let lastError: Error | null = null;

    // Intentar con cada configuración hasta que una funcione
    for (const config of modelConfigs) {
      try {
        console.log(`🎨 [HUGGING FACE] Generando con ${config.model} (provider: ${config.provider})...`);
        console.log('📝 Prompt:', prompt.substring(0, 150) + '...');

        // Usar la API según documentación oficial
        const result = await this.client.textToImage({
          provider: config.provider,
          model: config.model,
          inputs: prompt,
          parameters: {
            num_inference_steps: config.steps,
          }
        });

        // Convertir resultado a base64
        let buffer: Buffer;
        const resultAny = result as any;
        
        // El resultado puede ser Blob, ArrayBuffer o Buffer
        if (resultAny && typeof resultAny.arrayBuffer === 'function') {
          const arrayBuffer = await resultAny.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else if (resultAny instanceof ArrayBuffer) {
          buffer = Buffer.from(resultAny);
        } else if (Buffer.isBuffer(resultAny)) {
          buffer = resultAny;
        } else {
          throw new Error('Formato de respuesta no soportado: ' + typeof result);
        }

        const base64Image = buffer.toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;

        console.log(`✅ [HUGGING FACE] Imagen generada con ${config.model}`);
        return imageUrl;

      } catch (error: any) {
        console.warn(`⚠️ [HUGGING FACE] ${config.model} (${config.provider}) falló: ${error.message}`);
        lastError = error;
        // Continuar con el siguiente modelo/provider
      }
    }

    // Si todas las configuraciones fallaron
    console.error('❌ [HUGGING FACE] Todas las configuraciones fallaron');
    throw new Error(`Error generando imagen con Hugging Face: ${lastError?.message || 'Todos los modelos fallaron'}`);
  }

  /**
   * Genera una imagen con un modelo específico
   * @param prompt Descripción de la imagen
   * @param modelId ID del modelo de Hugging Face (ej: "stabilityai/stable-diffusion-2-1")
   */
  public async generateImageWithModel(prompt: string, modelId: string): Promise<string> {
    try {
      console.log(`🎨 [HUGGING FACE] Generando imagen con modelo: ${modelId}`);

      const result: any = await this.client.textToImage({
        model: modelId,
        inputs: prompt,
      });

      // Convertir la respuesta a base64
      let buffer: Buffer;
      
      if (result && typeof result.arrayBuffer === 'function') {
        const arrayBuffer = await result.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (result instanceof ArrayBuffer) {
        buffer = Buffer.from(result);
      } else if (Buffer.isBuffer(result)) {
        buffer = result;
      } else {
        throw new Error('Formato de respuesta no soportado: ' + typeof result);
      }

      const base64Image = buffer.toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      console.log('✅ [HUGGING FACE] Imagen generada exitosamente');
      return imageUrl;

    } catch (error: any) {
      console.error('❌ [HUGGING FACE] Error al generar imagen:', error.message);
      throw new Error(`Error generando imagen con modelo ${modelId}: ${error.message}`);
    }
  }

  /**
   * Verifica la disponibilidad del servicio
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Intenta generar una imagen simple para verificar conectividad
      await this.client.textToImage({
        model: 'stabilityai/stable-diffusion-3.5-large',
        inputs: 'test',
        parameters: {
          num_inference_steps: 1, // Mínimo para test rápido
        }
      });
      return true;
    } catch (error) {
      console.error('❌ [HUGGING FACE] Health check falló:', error);
      return false;
    }
  }
}
