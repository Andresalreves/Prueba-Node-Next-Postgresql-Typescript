import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint para obtener y cambiar el proveedor de IA
 * GET /api/ai/provider - Obtiene el proveedor activo y disponibles
 * POST /api/ai/provider - Cambia el proveedor (se guarda en memoria de la sesión)
 */

// Variable global para almacenar el proveedor seleccionado por el usuario
// En producción, esto debería guardarse en una base de datos
let selectedProvider: 'groq' | 'openai' = (process.env.AI_PROVIDER as 'groq' | 'openai') || 'groq';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener proveedor activo y disponibles
    const available: string[] = [];
    
    if (process.env.GROQ_API_KEY) {
      available.push('groq');
    }
    
    if (process.env.OPENAI_API_KEY) {
      available.push('openai');
    }

    return res.status(200).json({
      current: selectedProvider,
      available: available,
      hasGroq: !!process.env.GROQ_API_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
    });
  }

  if (req.method === 'POST') {
    const { provider } = req.body;

    if (!provider || !['groq', 'openai'].includes(provider)) {
      return res.status(400).json({ error: 'Proveedor inválido. Usa "groq" o "openai"' });
    }

    // Verificar que el proveedor tenga API key configurada
    if (provider === 'groq' && !process.env.GROQ_API_KEY) {
      return res.status(400).json({ error: 'Groq no está configurado. Agrega GROQ_API_KEY al .env' });
    }

    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI no está configurado. Agrega OPENAI_API_KEY al .env' });
    }

    // Cambiar proveedor
    selectedProvider = provider;
    
    // Actualizar la variable de entorno temporalmente (solo para esta sesión)
    process.env.AI_PROVIDER = provider;

    console.log(`🔄 [PROVIDER CHANGE] Proveedor cambiado a: ${provider.toUpperCase()}`);

    return res.status(200).json({
      success: true,
      message: `Proveedor cambiado a ${provider}`,
      current: selectedProvider,
    });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

// Exportar la función para acceder al proveedor actual
export function getCurrentProvider(): 'groq' | 'openai' {
  return selectedProvider;
}
