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
  // Variables de OpenAI
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  
  // Variables de Meta (Facebook)
  META_PAGE_TOKEN: getEnvVar('META_PAGE_TOKEN'),
  META_VERIFY_TOKEN: getEnvVar('META_VERIFY_TOKEN'),
  
  // Base de datos
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  
  // Entorno de Node
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const;
