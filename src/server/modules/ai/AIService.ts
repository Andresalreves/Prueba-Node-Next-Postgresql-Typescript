import { GroqService } from '@/server/modules/groq/GroqService';
import { OpenAIService } from '@/server/modules/openai/OpenAIService';
import { HuggingFaceService } from '@/server/modules/huggingface/HuggingFaceService';
import { env } from '@/utils/env';

/**
 * Servicio unificado de IA que permite elegir entre Groq y OpenAI
 * Cambia el proveedor en .env con AI_PROVIDER=groq o AI_PROVIDER=openai
 */
export class AIService {
  private groqService: GroqService | null = null;
  private openaiService: OpenAIService | null = null;
  private huggingFaceService: HuggingFaceService | null = null;
  private provider: 'groq' | 'openai';

  constructor() {
    // Determinar qué proveedor usar según .env
    this.provider = (env.AI_PROVIDER as 'groq' | 'openai') || 'groq';

    // Inicializar servicios disponibles
    if (env.GROQ_API_KEY) {
      this.groqService = new GroqService();
    }
    
    if (env.OPENAI_API_KEY) {
      this.openaiService = new OpenAIService();
    }

    // Inicializar Hugging Face para generación de imágenes (usado con GROQ)
    if (env.HF_TOKEN) {
      try {
        this.huggingFaceService = new HuggingFaceService();
        console.log('✅ [AI SERVICE] HuggingFaceService inicializado correctamente');
      } catch (error: any) {
        console.error('❌ [AI SERVICE] Error al inicializar Hugging Face:', error.message);
      }
    } else {
      console.warn('⚠️ [AI SERVICE] HF_TOKEN no encontrado en .env - Generación de imágenes limitada');
    }

    console.log(`🤖 [AI SERVICE] Proveedor activo: ${this.provider.toUpperCase()}`);
    if (this.provider === 'groq' && this.huggingFaceService) {
      console.log('🎨 [AI SERVICE] Generación de imágenes: Groq + Stable Diffusion (2 pasos)');
    } else if (this.provider === 'groq' && !this.huggingFaceService) {
      console.log('📝 [AI SERVICE] Generación de imágenes: Solo descripciones (falta HF_TOKEN)');
    }
  }

  /**
   * Genera una respuesta corta con el proveedor configurado
   */
  public async generateCopy(userMessage: string): Promise<string> {
    try {
      if (this.provider === 'groq' && this.groqService) {
        console.log('🤖 Usando Groq (Llama 3.3 70B)...');
        return await this.groqService.generateCopy(userMessage);
      } else if (this.provider === 'openai' && this.openaiService) {
        console.log('🤖 Usando OpenAI (GPT-5)...');
        return await this.openaiService.generateCopy(userMessage);
      } else {
        throw new Error(`Proveedor ${this.provider} no disponible`);
      }
    } catch (error: any) {
      console.error(`❌ Error con ${this.provider}:`, error.message);
      
      // Fallback automático al otro proveedor
      return await this.fallbackGenerate(userMessage, error);
    }
  }

  /**
   * Genera respuestas detalladas
   */
  public async generateDetailedCopy(userMessage: string): Promise<string> {
    try {
      if (this.provider === 'groq' && this.groqService) {
        return await this.groqService.generateDetailedCopy(userMessage);
      } else if (this.provider === 'openai' && this.openaiService) {
        return await this.openaiService.generateDetailedCopy(userMessage);
      } else {
        throw new Error(`Proveedor ${this.provider} no disponible`);
      }
    } catch (error: any) {
      console.error(`❌ Error con ${this.provider}:`, error.message);
      return await this.fallbackDetailedGenerate(userMessage, error);
    }
  }

  /**
   * Genera o analiza imagen según el proveedor
   */
  public async generateImage(prompt: string): Promise<string> {
    try {
      if (this.provider === 'openai' && this.openaiService) {
        // OpenAI puede generar imágenes reales con DALL-E
        console.log('🎨 [AI SERVICE] Generando imagen con DALL-E (OpenAI)...');
        return await this.openaiService.generateImage(prompt);
      } else if (this.provider === 'groq') {
        // GROQ: Primero genera descripción detallada con Groq, luego la imagen con Stable Diffusion
        if (this.huggingFaceService && this.groqService) {
          console.log('🎨 [AI SERVICE] Paso 1: Generando descripción detallada con Groq...');
          // Groq crea una descripción muy detallada y visual
          const detailedPrompt = await this.groqService.generateImageDescription(prompt);
          
          console.log('🎨 [AI SERVICE] Paso 2: Generando imagen con Stable Diffusion...');
          console.log('📝 Prompt mejorado:', detailedPrompt.substring(0, 200) + '...');
          // Stable Diffusion usa la descripción detallada para generar mejor imagen
          return await this.huggingFaceService.generateImage(detailedPrompt);
        } else if (this.huggingFaceService) {
          // Si solo hay HF pero no Groq, usar el prompt directo
          console.log('🎨 [AI SERVICE] Generando imagen directamente con Stable Diffusion...');
          return await this.huggingFaceService.generateImage(prompt);
        } else if (this.groqService) {
          // Fallback: solo descripción si no hay HF_TOKEN
          console.warn('⚠️ [AI SERVICE] HF_TOKEN no configurado, generando solo descripción...');
          return await this.groqService.generateImageDescription(prompt);
        }
      }
      
      throw new Error(`Proveedor ${this.provider} no disponible para imágenes`);
    } catch (error: any) {
      console.error(`❌ Error generando imagen con ${this.provider}:`, error.message);
      
      // Fallback: intentar con descripción de texto
      if (this.groqService) {
        console.log('🔄 Fallback: Generando descripción con Groq...');
        return await this.groqService.generateImageDescription(prompt);
      }
      
      return 'Error: No se pudo generar imagen o descripción';
    }
  }

  /**
   * Analiza imagen (solo Groq con Llama 4 Scout)
   */
  public async analyzeImage(imageUrl: string, prompt?: string): Promise<string> {
    if (this.groqService) {
      return await this.groqService.analyzeImage(imageUrl, prompt);
    }
    
    throw new Error('Análisis de imágenes solo disponible con Groq (Llama 4 Scout)');
  }

  /**
   * Fallback automático a otro proveedor
   */
  private async fallbackGenerate(userMessage: string, originalError: Error): Promise<string> {
    console.log('🔄 Intentando fallback automático...');

    // Si Groq falló, intentar OpenAI
    if (this.provider === 'groq' && this.openaiService) {
      console.log('🔄 Fallback: Groq → OpenAI');
      try {
        return await this.openaiService.generateCopy(userMessage);
      } catch (fallbackError) {
        console.error('❌ Fallback a OpenAI también falló');
      }
    }

    // Si OpenAI falló, intentar Groq
    if (this.provider === 'openai' && this.groqService) {
      console.log('🔄 Fallback: OpenAI → Groq');
      try {
        return await this.groqService.generateCopy(userMessage);
      } catch (fallbackError) {
        console.error('❌ Fallback a Groq también falló');
      }
    }

    // Si todo falla, retornar mensaje genérico
    return "Lo siento, temporalmente no puedo generar respuestas. Por favor intenta más tarde.";
  }

  /**
   * Fallback para respuestas detalladas
   */
  private async fallbackDetailedGenerate(userMessage: string, originalError: Error): Promise<string> {
    console.log('🔄 Intentando fallback automático (detailed)...');

    if (this.provider === 'groq' && this.openaiService) {
      console.log('🔄 Fallback: Groq → OpenAI');
      try {
        return await this.openaiService.generateDetailedCopy(userMessage);
      } catch (e) {
        console.error('❌ Fallback falló');
      }
    }

    if (this.provider === 'openai' && this.groqService) {
      console.log('🔄 Fallback: OpenAI → Groq');
      try {
        return await this.groqService.generateDetailedCopy(userMessage);
      } catch (e) {
        console.error('❌ Fallback falló');
      }
    }

    return "Lo siento, temporalmente no puedo generar respuestas detalladas.";
  }

  /**
   * Obtiene el proveedor activo
   */
  public getProvider(): string {
    return this.provider;
  }

  /**
   * Verifica qué proveedores están disponibles
   */
  public getAvailableProviders(): string[] {
    const available: string[] = [];
    if (this.groqService) available.push('groq');
    if (this.openaiService) available.push('openai');
    return available;
  }

  /**
   * Health check del proveedor activo
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (this.provider === 'groq' && this.groqService) {
        return await this.groqService.healthCheck();
      } else if (this.provider === 'openai') {
        // OpenAI no tiene healthCheck, asumimos que está disponible si hay API key
        return !!this.openaiService;
      }
      return false;
    } catch (error) {
      console.error('❌ Health check falló:', error);
      return false;
    }
  }
}
