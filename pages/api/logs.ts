import { NextApiRequest, NextApiResponse } from 'next';
import { LogService } from '@/server/modules/logs/LogService';

const logService = new LogService();

/**
 * API endpoint para obtener todos los logs
 * GET /api/logs
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const logs = await logService.getAllLogs();
      return res.status(200).json(logs);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      return res.status(500).json({ error: 'Error al obtener los logs' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
