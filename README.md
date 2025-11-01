# Prueba Técnica: Node.js + Next.js + PostgreSQL + TypeScript + IA

**Backend**: Node.js + TypeScript + Next.js API Routes
- **Integraciones IA**:
  - Meta (Facebook) Graph API para recepción y envío de mensajes
  - 🚀 **OpenAI API (GPT-5)** para generación de texto avanzada
  - OpenAI API (GPT-4o-mini) como fallback automático
  - OpenAI API (DALL-E 3) para generación de imágenes
- **Base de Datos**: PostgreSQL a través de Prisma ORM, con Prisma Accelerate integrado
- **Frontend**: React + Next.js con dashboard administrativo

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado y corriendo
- Cuenta de Meta Developer con una página de Facebook configurada
- API Key de OpenAI
- npm o yarn instalado

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env` y llenar con los valores reales:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_bd?schema=public"
META_PAGE_TOKEN="tu_page_access_token"
META_VERIFY_TOKEN="tu_verify_token"
OPENAI_API_KEY="sk-tu_api_key"
NODE_ENV="development"
```

### 3. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la base de datos
npm run prisma:studio
```

### 4. Configurar el Webhook de Meta

1. Ir a [Meta Developers](https://developers.facebook.com/)
2. Seleccionar tu aplicación
3. En "Webhooks", agregar la URL de callback: `https://tu-dominio.com/api/meta/webhook`
4. Usar el mismo `META_VERIFY_TOKEN` que configuraste en `.env`
5. Suscribirse a los eventos: `messages`, `messaging_postbacks`

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
.
├── components/              # Componentes de React
│   └── LogList.tsx         # Tabla de logs
├── pages/                  # Páginas de Next.js
│   ├── admin/
│   │   └── dashboard.tsx   # Dashboard administrativo
│   ├── api/                # API Routes de Next.js
│   │   ├── ai/
│   │   │   └── generate.ts # Generar contenido con IA
│   │   ├── broadcast/
│   │   │   └── run.ts      # Ejecutar broadcasts
│   │   ├── meta/
│   │   │   ├── webhook.ts  # Webhook de Meta
│   │   │   └── message.ts  # Enviar mensajes manuales
│   │   └── logs.ts         # Obtener logs
│   ├── _app.tsx            # App wrapper
│   ├── _document.tsx       # HTML document
│   └── index.tsx           # Página principal
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
├── src/
│   ├── server/
│   │   ├── db/
│   │   │   └── prisma.ts   # Cliente de Prisma
│   │   └── modules/
│   │       ├── logs/
│   │       │   └── LogService.ts    # Servicio de logs
│   │       ├── meta/
│   │       │   └── MetaService.ts   # Servicio de Meta API
│   │       └── openai/
│   │           └── OpenAIService.ts # Servicio de OpenAI
│   └── utils/
│       └── env.ts          # Validación de variables de entorno
├── .env.example            # Ejemplo de variables de entorno
├── next.config.js          # Configuración de Next.js
├── package.json            # Dependencias
├── tsconfig.json           # Configuración de TypeScript
└── README.md

```

## 🔄 Flujo Funcional

### 1️⃣ Usuario → Página de Facebook
Un usuario escribe un mensaje a la página conectada (ej: "Hola").

### 2️⃣ Webhook (Inbound Message)
La aplicación recibe el mensaje a través del webhook configurado en Meta (`/api/meta/webhook`) y lo guarda en la base de datos.

### 3️⃣ Chatbot → Respuesta automática (Outbound Message)
La app envía una respuesta automática al usuario dentro de la ventana de 24 horas usando la Graph API.

### 4️⃣ Respuesta generada con IA
Antes de enviar la respuesta, el sistema llama a OpenAI para generar un texto apropiado.

### 5️⃣ Opcional: Generación de imagen
Se puede generar una imagen con DALL-E y enviar su URL como parte del mensaje.

### 6️⃣ Registro en PostgreSQL
Cada interacción se almacena con:
- ID del usuario
- Mensaje recibido
- Copy generada por IA
- Estado del envío (SENT/FAILED)
- Fecha/hora

### 7️⃣ Interfaz (Next.js)
El frontend permite:
- Ver mensajes recientes
- Probar envíos manuales
- Ejecutar broadcasts simulados
- Generar copy e imágenes con IA

## 🔌 Endpoints API

### `GET /api/logs`
Obtiene todos los logs de interacciones.

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "facebook_user_id",
    "inboundMsg": "Hola",
    "aiGeneratedCopy": "¡Hola! ¿En qué puedo ayudarte?",
    "aiGeneratedImage": "https://...",
    "outboundStatus": "SENT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `POST /api/meta/webhook`
Recibe webhooks de Meta (Facebook).

**Body:**
```json
{
  "entry": [{
    "messaging": [{
      "sender": { "id": "user_id" },
      "message": { "text": "Hola" }
    }]
  }]
}
```

### `GET /api/meta/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...`
Verifica el webhook de Meta.

### `POST /api/meta/message`
Envía un mensaje manual a un usuario.

**Body:**
```json
{
  "userId": "facebook_user_id",
  "text": "Mensaje a enviar",
  "generateAI": false
}
```

### `POST /api/ai/generate`
Genera contenido con OpenAI.

**Body:**
```json
{
  "prompt": "Texto base",
  "generateImage": false
}
```

**Response:**
```json
{
  "success": true,
  "copy": "Texto generado por IA",
  "image": "https://imagen.url"
}
```

### `POST /api/broadcast/run`
Ejecuta un broadcast a múltiples usuarios.

**Body:**
```json
{
  "userIds": ["user1", "user2"],
  "text": "Mensaje a enviar",
  "generateAI": false
}
```

## 🧪 Pruebas

### Probar el Webhook localmente con ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer el servidor local
ngrok http 3000

# Usar la URL de ngrok en la configuración de Meta
# Ejemplo: https://abc123.ngrok.io/api/meta/webhook
```

### Probar con Postman o cURL

```bash
# Probar generación de IA
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Saludo profesional", "generateImage": false}'

# Probar envío manual
curl -X POST http://localhost:3000/api/meta/message \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "text": "Hola", "generateAI": true}'
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Iniciar servidor de producción
- `npm run lint` - Ejecutar linter
- `npm run prisma:generate` - Generar cliente de Prisma
- `npm run prisma:migrate` - Ejecutar migraciones de base de datos
- `npm run prisma:studio` - Abrir Prisma Studio

## 📝 Notas Técnicas

### Arquitectura AI-First

- **Generación inteligente de respuestas**: Usa GPT-4o-mini para respuestas contextuales
- **Rate limiting**: Control de envío con delays para evitar límites de Meta
- **Error handling**: Manejo robusto de errores en todas las capas
- **Logging completo**: Registro de todas las interacciones en PostgreSQL

### Seguridad

- Variables de entorno protegidas
- Validación de webhook de Meta
- Sanitización de inputs
- HTTPS requerido para webhooks de Meta

### Escalabilidad

- Prisma Accelerate para cacheo de consultas
- Conexiones optimizadas a PostgreSQL
- API Routes serverless de Next.js
- Arquitectura modular y desacoplada

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm run prisma:generate
```

### Error de conexión a PostgreSQL
Verificar que PostgreSQL esté corriendo y que la `DATABASE_URL` sea correcta.

### Webhook no recibe mensajes
1. Verificar que la URL esté correcta en Meta Developer
2. Usar ngrok para exponer el servidor local
3. Verificar que `META_VERIFY_TOKEN` coincida

### Error de OpenAI API
Verificar que `OPENAI_API_KEY` sea válida y tenga créditos disponibles.

## 📄 Licencia

Este proyecto es una prueba técnica para demostración de habilidades en desarrollo AI-First con Node.js, Next.js, PostgreSQL y TypeScript.
