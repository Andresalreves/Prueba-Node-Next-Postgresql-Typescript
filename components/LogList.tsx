import React from 'react';

/**
 * Tipo de datos para un log de broadcast
 */
interface BroadcastLog {
  id: string;
  userId: string;
  inboundMsg: string;
  aiGeneratedCopy: string | null;
  aiGeneratedImage: string | null;
  outboundStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface LogListProps {
  logs: BroadcastLog[];
}

/**
 * Componente para mostrar la lista de logs de interacciones
 */
const LogList: React.FC<LogListProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No hay logs registrados aún.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '1px solid #ddd'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={tableHeaderStyle}>Fecha</th>
            <th style={tableHeaderStyle}>Usuario ID</th>
            <th style={tableHeaderStyle}>Mensaje Recibido</th>
            <th style={tableHeaderStyle}>Respuesta IA</th>
            <th style={tableHeaderStyle}>Imagen</th>
            <th style={tableHeaderStyle}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={tableCellStyle}>
                {new Date(log.createdAt).toLocaleString('es-ES')}
              </td>
              <td style={tableCellStyle}>
                {log.userId.substring(0, 10)}...
              </td>
              <td style={tableCellStyle}>
                {log.inboundMsg}
              </td>
              <td style={tableCellStyle}>
                {log.aiGeneratedCopy || '-'}
              </td>
              <td style={tableCellStyle}>
                {log.aiGeneratedImage ? (
                  <a 
                    href={log.aiGeneratedImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#0070f3' }}
                  >
                    Ver
                  </a>
                ) : '-'}
              </td>
              <td style={{
                ...tableCellStyle,
                color: getStatusColor(log.outboundStatus),
                fontWeight: 'bold'
              }}>
                {log.outboundStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Estilos para las celdas de la tabla
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  fontWeight: 'bold'
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left'
};

// Función para obtener el color según el estado
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'SENT':
      return '#28a745'; // Verde
    case 'FAILED':
      return '#dc3545'; // Rojo
    case 'PENDING':
      return '#ffc107'; // Amarillo
    default:
      return '#6c757d'; // Gris
  }
};

export default LogList;
