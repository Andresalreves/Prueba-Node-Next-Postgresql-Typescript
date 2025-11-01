import { db } from '@/server/db/prisma';

/**
 * Servicio para gestionar los logs de broadcast en la base de datos
 * Registra todas las interacciones con los usuarios
 */
export class LogService {
  /**
   * Crea un nuevo log de mensaje inbound (recibido del usuario)
   * @param userId - ID del usuario de Meta (Facebook Messenger)
   * @param inboundMsg - Mensaje recibido del usuario
   * @returns ID del log creado
   */
  public async createLog(userId: string, inboundMsg: string): Promise<string> {
    const log = await db.broadcastLog.create({
      data: {
        userId,
        inboundMsg,
        outboundStatus: 'PENDING',
      },
    });
    return log.id;
  }

  /**
   * Actualiza el estado de un log después de procesar el mensaje
   * @param logId - ID del log a actualizar
   * @param status - Estado del envío (SENT, FAILED)
   * @param aiGeneratedCopy - Texto generado por IA
   * @param aiGeneratedImage - URL de imagen generada por IA (opcional)
   */
  public async updateLogStatus(
    logId: string,
    status: 'SENT' | 'FAILED',
    aiGeneratedCopy?: string,
    aiGeneratedImage?: string
  ): Promise<void> {
    await db.broadcastLog.update({
      where: { id: logId },
      data: {
        outboundStatus: status,
        aiGeneratedCopy,
        aiGeneratedImage,
      },
    });
  }

  /**
   * Obtiene todos los logs de la base de datos (ordenados por fecha)
   * @param limit - Número máximo de logs a retornar (default: 50)
   * @returns Lista de logs
   */
  public async getAllLogs(limit: number = 50) {
    return await db.broadcastLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtiene un log específico por su ID
   * @param logId - ID del log
   * @returns Log encontrado o null
   */
  public async getLogById(logId: string) {
    return await db.broadcastLog.findUnique({
      where: { id: logId },
    });
  }

  /**
   * Obtiene todos los logs de un usuario específico
   * @param userId - ID del usuario
   * @returns Lista de logs del usuario
   */
  public async getLogsByUserId(userId: string) {
    return await db.broadcastLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
