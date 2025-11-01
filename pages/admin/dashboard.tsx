import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Log {
  id: string;
  userId: string;
  inboundMsg: string;
  aiGeneratedCopy: string | null;
  aiGeneratedImage: string | null;
  outboundStatus: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [userId, setUserId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Estados para Broadcast
  const [broadcastUserIds, setBroadcastUserIds] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastWithAI, setBroadcastWithAI] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Auto-refresh logs cada 3 segundos
  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  // Enviar mensaje a Facebook con IA
  const handleSendMessage = async () => {
    if (!userId || !messageText) {
      alert('Por favor ingresa userId y mensaje');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/meta/message', {
        userId: userId,
        text: messageText,
        generateAI: true
      });
      
      alert(response.data.message || 'Mensaje enviado');
      setMessageText('');
      fetchLogs();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || 'No se pudo enviar'));
    } finally {
      setLoading(false);
    }
  };

  // Generar imagen con DALL-E
  const handleGenerateImage = async () => {
    if (!imagePrompt) {
      alert('Por favor ingresa un prompt para la imagen');
      return;
    }

    setLoading(true);
    setImageUrl('');
    try {
      const response = await axios.post('/api/ai/generate', {
        prompt: imagePrompt,
        generateImage: true
      });
      
      setImageUrl(response.data.image);
      alert('¡Imagen generada exitosamente!');
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || 'No se pudo generar imagen'));
    } finally {
      setLoading(false);
    }
  };

  // Enviar broadcast a múltiples usuarios
  const handleBroadcast = async () => {
    if (!broadcastUserIds || !broadcastMessage) {
      alert('Por favor ingresa los User IDs y el mensaje');
      return;
    }

    // Convertir string de IDs separados por comas a array
    const userIdsArray = broadcastUserIds.split(',').map((id: string) => id.trim()).filter((id: string) => id);
    
    if (userIdsArray.length === 0) {
      alert('Por favor ingresa al menos un User ID válido');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/broadcast/run', {
        userIds: userIdsArray,
        text: broadcastMessage,
        generateAI: broadcastWithAI
      });
      
      const { totalSent, totalFailed } = response.data;
      alert(`Broadcast completado!\n✅ Enviados: ${totalSent}\n❌ Fallidos: ${totalFailed}`);
      setBroadcastMessage('');
      fetchLogs();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || 'No se pudo ejecutar el broadcast'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return '#10b981';
      case 'FAILED': return '#ef4444';
      case 'PENDING': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🤖 Chatbot IA Dashboard</h1>
          <p style={styles.subtitle}>Panel de administración y monitoreo</p>
        </div>
        <div style={styles.autoRefresh}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e: any) => setAutoRefresh(e.target.checked)}
              style={styles.checkbox}
            />
            Auto-actualizar
          </label>
        </div>
      </header>

      <div style={styles.grid}>
        {/* Enviar Mensaje a Facebook */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>📤 Enviar Mensaje a Facebook</h2>
            <span style={styles.badge}>Con IA</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.formGroup}>
              <label style={styles.label}>User ID de Facebook</label>
              <input
                type="text"
                value={userId}
                onChange={(e: any) => setUserId(e.target.value)}
                placeholder="Ej: 1234567890"
                style={styles.input}
              />
              <p style={styles.hint}>
                💡 Obtén el userId enviando un mensaje desde Messenger a tu página
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mensaje</label>
              <textarea
                value={messageText}
                onChange={(e: any) => setMessageText(e.target.value)}
                placeholder="Escribe el mensaje que quieres enviar..."
                style={styles.textarea}
                rows={3}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? '⏳ Enviando...' : '🚀 Enviar con IA'}
            </button>
          </div>
        </section>

        {/* Generar Imagen */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>🎨 Generar Imagen con IA</h2>
            <span style={{...styles.badge, backgroundColor: '#8b5cf6'}}>DALL-E 3</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Descripción de la imagen</label>
              <textarea
                value={imagePrompt}
                onChange={(e: any) => setImagePrompt(e.target.value)}
                placeholder="Ej: Un unicornio volando en el espacio estrellado"
                style={styles.textarea}
                rows={3}
              />
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: '#8b5cf6',
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? '⏳ Generando...' : '✨ Generar Imagen'}
            </button>

            {imageUrl && (
              <div style={styles.imagePreview}>
                <img src={imageUrl} alt="Generated" style={styles.image} />
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" style={styles.imageLink}>
                  🔗 Ver imagen completa
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Broadcast a Múltiples Usuarios */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>📢 Broadcast (Varios Usuarios)</h2>
            <span style={{...styles.badge, backgroundColor: '#f59e0b'}}>Múltiples</span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.formGroup}>
              <label style={styles.label}>User IDs (separados por comas)</label>
              <input
                type="text"
                value={broadcastUserIds}
                onChange={(e: any) => setBroadcastUserIds(e.target.value)}
                placeholder="Ej: 123456789, 987654321, 555666777"
                style={styles.input}
              />
              <p style={styles.hint}>
                💡 Ingresa múltiples IDs separados por comas para enviar el mismo mensaje a todos
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mensaje a enviar</label>
              <textarea
                value={broadcastMessage}
                onChange={(e: any) => setBroadcastMessage(e.target.value)}
                placeholder="Escribe el mensaje que se enviará a todos los usuarios..."
                style={styles.textarea}
                rows={3}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={broadcastWithAI}
                  onChange={(e: any) => setBroadcastWithAI(e.target.checked)}
                  style={styles.checkbox}
                />
                Generar copy con IA antes de enviar
              </label>
            </div>

            <button
              onClick={handleBroadcast}
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: '#f59e0b',
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? '⏳ Enviando...' : '📢 Enviar Broadcast'}
            </button>
          </div>
        </section>
      </div>

      {/* Logs Section */}
      <section style={styles.logsSection}>
        <div style={styles.logsSectionHeader}>
          <h2 style={styles.cardTitle}>📊 Historial de Conversaciones</h2>
          <button onClick={fetchLogs} style={styles.refreshButton}>
            🔄 Actualizar
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>No hay conversaciones aún</p>
            <p style={styles.emptyStateHint}>
              Envía un mensaje desde Messenger o usa el formulario arriba
            </p>
          </div>
        ) : (
          <div style={styles.logsGrid}>
            {logs.map((log: Log) => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logHeader}>
                  <span style={styles.logUserId}>
                    👤 {log.userId.substring(0, 15)}...
                  </span>
                  <span
                    style={{
                      ...styles.logStatus,
                      backgroundColor: getStatusColor(log.outboundStatus)
                    }}
                  >
                    {log.outboundStatus}
                  </span>
                </div>

                <div style={styles.logContent}>
                  <div style={styles.logMessage}>
                    <strong style={styles.logLabel}>📨 Mensaje recibido:</strong>
                    <p style={styles.logText}>{log.inboundMsg}</p>
                  </div>

                  {log.aiGeneratedCopy && (
                    <div style={styles.logMessage}>
                      <strong style={styles.logLabel}>🤖 Respuesta IA:</strong>
                      <p style={styles.logText}>{log.aiGeneratedCopy}</p>
                    </div>
                  )}

                  {log.aiGeneratedImage && (
                    <div style={styles.logMessage}>
                      <strong style={styles.logLabel}>🖼️ Imagen generada:</strong>
                      <a
                        href={log.aiGeneratedImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.imageLink}
                      >
                        Ver imagen
                      </a>
                    </div>
                  )}
                </div>

                <div style={styles.logFooter}>
                  <span style={styles.logDate}>
                    🕐 {formatDate(log.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// Estilos modernos con tema oscuro
const styles: { [key: string]: any } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #1e293b'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  subtitle: {
    color: '#94a3b8',
    margin: '0.5rem 0 0 0',
    fontSize: '1rem'
  },
  autoRefresh: {
    display: 'flex',
    alignItems: 'center'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#cbd5e1'
  },
  checkbox: {
    width: '1.2rem',
    height: '1.2rem',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #334155'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #334155',
    backgroundColor: '#1a2332'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    color: '#f1f5f9'
  },
  badge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  cardContent: {
    padding: '1.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#cbd5e1',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#0f172a',
    border: '2px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#0f172a',
    border: '2px solid #334155',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  hint: {
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: '#64748b'
  },
  button: {
    width: '100%',
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white'
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  imagePreview: {
    marginTop: '1.5rem',
    textAlign: 'center'
  },
  image: {
    maxWidth: '100%',
    borderRadius: '8px',
    border: '2px solid #334155'
  },
  imageLink: {
    display: 'inline-block',
    marginTop: '1rem',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  logsSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    overflow: 'hidden'
  },
  logsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #334155',
    backgroundColor: '#1a2332'
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#374151',
    border: 'none',
    borderRadius: '6px',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem'
  },
  emptyStateText: {
    fontSize: '1.25rem',
    color: '#94a3b8',
    marginBottom: '0.5rem'
  },
  emptyStateHint: {
    color: '#64748b',
    fontSize: '0.9rem'
  },
  logsGrid: {
    padding: '1.5rem',
    display: 'grid',
    gap: '1rem'
  },
  logCard: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '1.25rem',
    border: '1px solid #334155'
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  logUserId: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    fontFamily: 'monospace'
  },
  logStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'white'
  },
  logContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  logMessage: {
    paddingLeft: '0.5rem',
    borderLeft: '3px solid #334155'
  },
  logLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#cbd5e1',
    fontSize: '0.85rem'
  },
  logText: {
    margin: 0,
    color: '#e2e8f0',
    lineHeight: '1.6'
  },
  logFooter: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #334155',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  logDate: {
    fontSize: '0.8rem',
    color: '#64748b'
  }
};

export default AdminDashboard;
