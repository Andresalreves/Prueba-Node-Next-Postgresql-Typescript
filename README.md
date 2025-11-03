# 🤖 Chatbot con IA + Meta Messenger + PostgreSQL

**Sistema completo de chatbot con múltiples proveedores de IA**

## ⭐ Características Principales

### 🎯 Selector de Proveedor de IA
Elige entre dos proveedores de IA según tus necesidades:

- **🚀 GROQ** (Recomendado - Gratis y Rápido)
  - Llama 3.3 70B para generación de texto
  - Llama 4 Scout para análisis de imágenes
  - **Stable Diffusion** (Hugging Face) para generación de imágenes
  - Sin costo, alta velocidad

- **🔥 OpenAI** (Premium)
  - GPT-4o/GPT-5 para generación de texto
  - DALL-E 3 para generación de imágenes
  - Máxima calidad, requiere créditos

### 🎨 Generación de Imágenes Avanzada
- **Con GROQ**: Flujo de 2 pasos
  1. Groq genera descripción detallada del prompt
  2. Stable Diffusion (Hugging Face) crea la imagen
- **Con OpenAI**: DALL-E 3 generación directa
- Imágenes en formato base64 listas para usar

### 🔐 Webhook de Meta 100% Compatible
- Cumple **todos** los requisitos de la documentación oficial de Facebook
- Validación de firma X-Hub-Signature-256
- Respuesta 200 OK en menos de 5 segundos
- Manejo de timestamp para orden cronológico
- Script de testing incluido

### 🛠️ Stack Tecnológico
- **Backend**: Node.js + TypeScript + Next.js API Routes
- **Base de Datos**: PostgreSQL + Prisma ORM
- **IA**: GROQ / OpenAI / Hugging Face
- **Mensajería**: Meta (Facebook) Graph API
- **Frontend**: React + Next.js con dashboard

## 📋 Requisitos Previos

- Node.js 18+ instalado (recomendado: v22 con nvm)
- PostgreSQL 12+ instalado y corriendo
- Cuenta de Meta Developer con una página de Facebook configurada
- **Al menos UNA de las siguientes API Keys**:
  - GROQ API Key (Gratis) → [console.groq.com](https://console.groq.com/keys)
  - OpenAI API Key (Pago) → [platform.openai.com](https://platform.openai.com/api-keys)
  - Hugging Face Token (Para imágenes con GROQ) → [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- npm instalado

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
# Base de datos (REQUERIDA)
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_bd?schema=public"

# Meta/Facebook (REQUERIDAS)
META_PAGE_TOKEN="tu_page_access_token"
META_VERIFY_TOKEN="tu_verify_token_personalizado"
META_APP_SECRET="tu_app_secret"  # Opcional pero recomendado

# Selector de Proveedor de IA (REQUERIDO)
AI_PROVIDER="groq"  # Opciones: "groq" o "openai"

# GROQ (Gratis - Recomendado)
GROQ_API_KEY="gsk_tu_groq_api_key"

# OpenAI (Pago - Opcional)
OPENAI_API_KEY="sk-tu_openai_api_key"

# Hugging Face (Para generar imágenes con GROQ)
HF_TOKEN="hf_tu_huggingface_token"

# Entorno
NODE_ENV="development"
```

#### 🔑 Cómo Obtener los Tokens:

1. **GROQ_API_KEY**: https://console.groq.com/keys (Gratis)
2. **OPENAI_API_KEY**: https://platform.openai.com/api-keys (Requiere créditos)
3. **HF_TOKEN**: https://huggingface.co/settings/tokens (Gratis - Para imágenes)
4. **META_PAGE_TOKEN**: Facebook Developer Console → Tu App → Messenger → Tokens
5. **META_APP_SECRET**: Facebook Developer Console → Configuración → Configuración básica

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

### 5. Configurar Node.js (Recomendado)

```bash
# Usar Node.js v22 con nvm
nvm use 22
```

### 6. Verificar Configuración

Antes de iniciar, verifica que tus tokens sean válidos:

```bash
# Verificar variables de entorno
node scripts/check-config.js

# Verificar token de Hugging Face (si usas GROQ para imágenes)
node scripts/test-hf-token.js
```

### 7. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 8. Testear el Webhook Localmente

```bash
# Ejecutar script de pruebas
./scripts/test-webhook.sh
```

Deberías ver:
- ✅ Test 1: `CHALLENGE_ACCEPTED`
- ✅ Test 2: `EVENT_RECEIVED`

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
├── scripts/                # Scripts de utilidad
│   ├── check-config.js     # Verificar variables de entorno
│   ├── test-hf-token.js    # Verificar token de Hugging Face
│   └── test-webhook.sh     # Testear webhook localmente
├── src/
│   ├── server/
│   │   ├── db/
│   │   │   └── prisma.ts       # Cliente de Prisma
│   │   └── modules/
│   │       ├── ai/
│   │       │   └── AIService.ts        # Servicio unificado de IA
│   │       ├── groq/
│   │       │   └── GroqService.ts      # Servicio de GROQ
│   │       ├── openai/
│   │       │   └── OpenAIService.ts    # Servicio de OpenAI
│   │       ├── huggingface/
│   │       │   └── HuggingFaceService.ts # Servicio de Hugging Face
│   │       ├── logs/
│   │       │   └── LogService.ts       # Servicio de logs
│   │       └── meta/
│   │           └── MetaService.ts      # Servicio de Meta API
│   └── utils/
│       └── env.ts              # Validación de variables de entorno
├── .env.example                # Ejemplo de variables de entorno
├── FACEBOOK_WEBHOOK_CHECKLIST.md  # Guía completa de webhooks
├── next.config.js          # Configuración de Next.js
├── package.json            # Dependencias
├── tsconfig.json           # Configuración de TypeScript
└── README.md

```

## 🔄 Flujo Funcional

### 1️⃣ Usuario → Página de Facebook
Un usuario escribe un mensaje a la página conectada (ej: "Hola").

### 2️⃣ Webhook (Inbound Message)
- La aplicación recibe el mensaje a través del webhook `/api/meta/webhook`
- ✅ Valida firma X-Hub-Signature-256
- ✅ Responde 200 OK en <5 segundos
- ✅ Captura timestamp para orden cronológico
- ✅ Guarda en base de datos

### 3️⃣ Procesamiento Asíncrono
Después de enviar 200 OK, el sistema:
1. Detecta el proveedor de IA configurado (`AI_PROVIDER`)
2. Genera respuesta con GROQ o OpenAI
3. Opcionalmente genera imagen:
   - **GROQ**: Groq describe + Stable Diffusion genera
   - **OpenAI**: DALL-E 3 genera directamente

### 4️⃣ Chatbot → Respuesta automática
Envía la respuesta al usuario usando Meta Graph API

### 5️⃣ Registro en PostgreSQL
Cada interacción se almacena con:
- ID del usuario
- Mensaje recibido
- Copy generada por IA
- Imagen generada (opcional)
- Estado del envío (SENT/FAILED)
- Timestamp

### 6️⃣ Dashboard Administrativo
Interfaz para:
- Ver mensajes recientes
- Probar envíos manuales
- Ejecutar broadcasts
- Generar contenido con IA
- Cambiar proveedor de IA

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
Genera contenido con el proveedor de IA configurado (GROQ o OpenAI).

**Body:**
```json
{
  "prompt": "Texto base",
  "generateImage": true
}
```

**Response:**
```json
{
  "success": true,
  "copy": "Texto generado por IA",
  "image": "data:image/png;base64,...",
  "isImageDescription": false
}
```

### `GET /api/ai/provider`
Obtiene el proveedor de IA activo y los disponibles.

**Response:**
```json
{
  "active": "groq",
  "available": ["groq", "openai"]
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

## 🧪 Testing

### 🛠️ Pruebas Automáticas del Webhook

#### Opción 1: Script de Testing (Recomendado)

```bash
# Ejecutar script de pruebas completo
./scripts/test-webhook.sh
```

Esto probará:
1. ✅ Verificación GET del webhook
2. ✅ Recepción POST de mensajes

#### Opción 2: Testing Manual

**Test 1: Verificación GET**
```bash
curl -X GET "http://localhost:3000/api/meta/webhook?hub.verify_token=TU_TOKEN&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
```

Resultado esperado: `CHALLENGE_ACCEPTED`

**Test 2: Mensaje POST**
```bash
curl -H "Content-Type: application/json" \
     -X POST "http://localhost:3000/api/meta/webhook" \
     -d '{
       "object": "page",
       "entry": [{
         "messaging": [{
           "sender": {"id": "USER_123"},
           "recipient": {"id": "PAGE_123"},
           "timestamp": 1458692752478,
           "message": {"text": "Hola"}
         }]
       }]
     }'
```

Resultado esperado: `EVENT_RECEIVED`

### 🌐 Probar con ngrok (Producción Local)

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer el servidor local con HTTPS
ngrok http 3000

# Usar la URL de ngrok en Facebook Developer Console
# Ejemplo: https://abc123.ngrok-free.app/api/meta/webhook
```

### 🧪 Pruebas de IA

**Probar generación con GROQ:**
```bash
# Asegúrate que AI_PROVIDER="groq" en .env
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Un perro tocando guitarra", "generateImage": true}'
```

**Probar generación con OpenAI:**
```bash
# Cambia AI_PROVIDER="openai" en .env y reinicia
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Un gato astronauta", "generateImage": true}'
```

### 🔐 Verificar Tokens

**Verificar configuración completa:**
```bash
node scripts/check-config.js
```

**Verificar token de Hugging Face:**
```bash
node scripts/test-hf-token.js
```

## 🛠️ Scripts Disponibles

### Scripts de Desarrollo
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Iniciar servidor de producción
- `npm run lint` - Ejecutar linter

### Scripts de Base de Datos
- `npm run prisma:generate` - Generar cliente de Prisma
- `npm run prisma:migrate` - Ejecutar migraciones de base de datos
- `npm run prisma:studio` - Abrir Prisma Studio (GUI para ver datos)

### Scripts de Testing
- `./scripts/test-webhook.sh` - Testear webhook localmente
- `node scripts/check-config.js` - Verificar variables de entorno
- `node scripts/test-hf-token.js` - Verificar token de Hugging Face

### Scripts de Node
- `nvm use 22` - Cambiar a Node.js v22 (recomendado)

## 📝 Notas Técnicas

### Arquitectura AI-First con Selector de Proveedor

- **Selección flexible de IA**: Cambia entre GROQ y OpenAI con una variable de entorno
- **Sistema de fallback automático**: Si un proveedor falla, intenta con el otro
- **Generación de imágenes híbrida**: 
  - GROQ: Descripción con Llama + Generación con Stable Diffusion
  - OpenAI: DALL-E 3 directo
- **Rate limiting**: Control de envío con delays para evitar límites de Meta
- **Error handling**: Manejo robusto de errores en todas las capas
- **Logging completo**: Registro de todas las interacciones en PostgreSQL

### Seguridad

- 🔐 Variables de entorno protegidas
- ✅ Validación completa de webhook según Meta:
  - Verificación de token (`hub.verify_token`)
  - Validación de firma X-Hub-Signature-256 con APP_SECRET
  - Respuesta 200 OK inmediata (<5 segundos)
  - Procesamiento asíncrono después de responder
- 🛡️ Sanitización de inputs
- 🔒 HTTPS requerido para webhooks de Meta en producción

### Escalabilidad

- 🚀 Prisma Accelerate para cacheo de consultas
- 📦 Conexiones optimizadas a PostgreSQL
- ⚡ API Routes serverless de Next.js
- 🏛️ Arquitectura modular y desacoplada:
  - `AIService` centraliza lógica de IA
  - Servicios independientes para cada proveedor
  - Fácil agregar nuevos proveedores de IA

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm run prisma:generate
```

### Error de conexión a PostgreSQL
Verificar que PostgreSQL esté corriendo y que la `DATABASE_URL` sea correcta.

```bash
# En Linux/Mac, verificar si PostgreSQL está corriendo
sudo systemctl status postgresql

# O con:
ps aux | grep postgres
```

### Webhook no recibe mensajes

1. **Verificar configuración**: 
   ```bash
   node scripts/check-config.js
   ```

2. **Testear localmente**:
   ```bash
   ./scripts/test-webhook.sh
   ```

3. **Verificar en Meta Developer**:
   - URL correcta: `https://tu-dominio.com/api/meta/webhook`
   - Token de verificación coincide con `META_VERIFY_TOKEN`
   - Suscrito a campos: `messages`, `messaging_postbacks`

4. **Para desarrollo local**:
   ```bash
   ngrok http 3000
   # Usar URL de ngrok en Facebook Developer
   ```

### Error: "Invalid credentials" de Hugging Face

**Síntoma**: No se generan imágenes, solo descripciones.

**Solución**:
```bash
# Verificar que tu token sea válido
node scripts/test-hf-token.js
```

Si el token es inválido:
1. Ve a https://huggingface.co/settings/tokens
2. Crea un nuevo token con permisos "Read"
3. Actualiza `HF_TOKEN` en tu `.env`
4. Reinicia el servidor

### Error de GROQ API

Verificar que `GROQ_API_KEY` sea válida:
```bash
curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer TU_GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}], "model": "llama-3.3-70b-versatile"}'
```

### Error de OpenAI API

Verificar que `OPENAI_API_KEY` sea válida y tenga créditos disponibles:
- Ve a https://platform.openai.com/usage
- Verifica tu saldo de créditos

### Imágenes no se generan con GROQ

**Verificar**:
1. ✅ `AI_PROVIDER="groq"` en `.env`
2. ✅ `HF_TOKEN` configurado en `.env`
3. ✅ Token de Hugging Face válido:
   ```bash
   node scripts/test-hf-token.js
   ```

### Cambiar entre GROQ y OpenAI

1. Editar `.env`:
   ```env
   AI_PROVIDER="groq"  # o "openai"
   ```

2. Reiniciar servidor:
   ```bash
   # Detener con Ctrl+C
   npm run dev
   ```

3. Verificar cambio:
   ```bash
   curl http://localhost:3000/api/ai/provider
   ```

## 📚 Documentación Adicional

- **`FACEBOOK_WEBHOOK_CHECKLIST.md`**: Guía completa de implementación de webhooks según Facebook
- **Scripts en `scripts/`**: Herramientas de testing y verificación
- **`.env.example`**: Plantilla con todas las variables de entorno necesarias

## 🎯 Características Destacadas

✅ **Selector de Proveedor de IA**: GROQ (gratis) o OpenAI (premium)  
✅ **Generación de Imágenes**: Stable Diffusion + DALL-E 3  
✅ **Webhook 100% Compatible**: Cumple todos los requisitos de Facebook  
✅ **Testing Integrado**: Scripts para probar localmente  
✅ **Validación de Seguridad**: Firma X-Hub-Signature-256  
✅ **Fallback Automático**: Si un proveedor falla, usa el otro  
✅ **Dashboard Administrativo**: Interfaz completa de gestión  
✅ **Base de Datos**: PostgreSQL con Prisma ORM  

## 💬 Contacto y Soporte

Para más información sobre la configuración:
- Revisa `FACEBOOK_WEBHOOK_CHECKLIST.md` para webhooks
- Ejecuta `node scripts/check-config.js` para diagnóstico
- Ejecuta `./scripts/test-webhook.sh` para testing

## 📄 Licencia

Este proyecto es una prueba técnica que demuestra:
- Integración con múltiples proveedores de IA (GROQ, OpenAI, Hugging Face)
- Implementación completa de webhooks de Meta/Facebook
- Arquitectura modular y escalable con TypeScript
- Testing y validación automatizada
