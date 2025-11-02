#!/usr/bin/env node

/**
 * Script para verificar si el token de Hugging Face es válido
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando token de Hugging Face...\n');

// Leer archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envFile = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

// Parsear HF_TOKEN
let HF_TOKEN = '';
envFile.split('\n').forEach(line => {
  const match = line.match(/^HF_TOKEN=(.*)$/);
  if (match) {
    HF_TOKEN = match[1].trim().replace(/^["']|["']$/g, '');
  }
});

if (!HF_TOKEN) {
  console.log('❌ ERROR: HF_TOKEN no encontrado en el archivo .env\n');
  console.log('📝 Pasos para configurar tu token:');
  console.log('1. Ve a: https://huggingface.co/settings/tokens');
  console.log('2. Crea un nuevo token con permisos de "Read"');
  console.log('3. Copia el token (formato: hf_xxxxxxxxxxxx)');
  console.log('4. Agrégalo a tu archivo .env como: HF_TOKEN="hf_tu_token_aqui"');
  process.exit(1);
}

console.log(`✅ Token encontrado: ${HF_TOKEN.substring(0, 10)}...${HF_TOKEN.substring(HF_TOKEN.length - 4)}`);
console.log(`📏 Longitud del token: ${HF_TOKEN.length} caracteres\n`);

// Verificar formato del token
if (!HF_TOKEN.startsWith('hf_')) {
  console.log('⚠️  ADVERTENCIA: El token no comienza con "hf_"');
  console.log('   Los tokens válidos de Hugging Face tienen el formato: hf_xxxxxxxxxxxx\n');
}

// Verificar que no tenga comillas o espacios
if (HF_TOKEN.includes('"') || HF_TOKEN.includes("'") || HF_TOKEN.includes(' ')) {
  console.log('❌ ERROR: El token contiene comillas o espacios');
  console.log('   Asegúrate de que en el .env esté así: HF_TOKEN=hf_tu_token');
  console.log('   O con comillas: HF_TOKEN="hf_tu_token"\n');
  process.exit(1);
}

// Intentar validar el token con la API
console.log('🔄 Verificando token con la API de Hugging Face...\n');

const https = require('https');

const options = {
  hostname: 'huggingface.co',
  port: 443,
  path: '/api/whoami-v2',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${HF_TOKEN}`
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Respuesta de la API:\n');
    
    if (res.statusCode === 200) {
      try {
        const userData = JSON.parse(data);
        console.log('✅ TOKEN VÁLIDO');
        console.log(`👤 Usuario: ${userData.name || userData.id || 'N/A'}`);
        console.log(`📧 Email: ${userData.email || 'N/A'}`);
        console.log(`🔑 Tipo de cuenta: ${userData.type || 'N/A'}\n`);
        
        console.log('═'.repeat(60));
        console.log('✅ Tu token está correctamente configurado');
        console.log('   Puedes generar imágenes con Stable Diffusion');
        console.log('═'.repeat(60));
        process.exit(0);
      } catch (e) {
        console.log('⚠️  Respuesta inesperada:', data);
        process.exit(1);
      }
    } else if (res.statusCode === 401) {
      console.log('❌ TOKEN INVÁLIDO (401 Unauthorized)');
      console.log('   El token no es válido o ha expirado\n');
      console.log('📝 Solución:');
      console.log('1. Ve a: https://huggingface.co/settings/tokens');
      console.log('2. Verifica que el token esté activo');
      console.log('3. Si no funciona, crea un nuevo token');
      console.log('4. Actualiza tu archivo .env con el nuevo token\n');
      process.exit(1);
    } else {
      console.log(`❌ Error ${res.statusCode}: ${res.statusMessage}`);
      console.log('Respuesta:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de red:', error.message);
  console.log('\n⚠️  No se pudo verificar el token por problemas de red');
  console.log('   Intenta nuevamente más tarde');
  process.exit(1);
});

req.end();
