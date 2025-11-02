/**
 * Utilidad para cargar y validar variables de entorno
 * Asegura que todas las variables requeridas estén definidas
 */

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${key}`);
  }
  return value;
}

export const env = {
  // Selector de proveedor de IA: 'groq' o 'openai'
  AI_PROVIDER: process.env.AI_PROVIDER || 'groq',
  
  // Variables de OpenAI (opcional si usas Groq)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Variables de Groq (opcional si usas OpenAI)
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  
  // Variables de Hugging Face (para generación de imágenes con Stable Diffusion)
  HF_TOKEN: process.env.HF_TOKEN || '',
  
  // Variables de Meta (Facebook)
  META_PAGE_TOKEN: getEnvVar('META_PAGE_TOKEN'),
  META_VERIFY_TOKEN: getEnvVar('META_VERIFY_TOKEN'),
  
  // Base de datos
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  
  // Entorno de Node
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const;
