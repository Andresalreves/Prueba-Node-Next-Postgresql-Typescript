#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del sistema...\n');

// Leer archivo .env
const envPath = path.join(__dirname, '..', '.env');
const envFile = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

// Parsear variables del archivo .env
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

// Usar process.env como fallback
const getEnv = (key) => envVars[key] || process.env[key];

// Variables a verificar
const checks = [
  { name: 'AI_PROVIDER', value: getEnv('AI_PROVIDER'), required: false },
  { name: 'GROQ_API_KEY', value: getEnv('GROQ_API_KEY'), required: false },
  { name: 'OPENAI_API_KEY', value: getEnv('OPENAI_API_KEY'), required: false },
  { name: 'HF_TOKEN', value: getEnv('HF_TOKEN'), required: false },
  { name: 'DATABASE_URL', value: getEnv('DATABASE_URL'), required: true },
  { name: 'META_PAGE_TOKEN', value: getEnv('META_PAGE_TOKEN'), required: true },
  { name: 'META_VERIFY_TOKEN', value: getEnv('META_VERIFY_TOKEN'), required: true },
];

let hasErrors = false;
let hasWarnings = false;

// Verificar cada variable
checks.forEach(check => {
  const status = check.value 
    ? '✅' 
    : check.required ? '❌' : '⚠️';
  
  const statusText = check.value 
    ? 'Configurado' 
    : check.required ? 'FALTA (Requerido)' : 'No configurado (Opcional)';
  
  console.log(`${status} ${check.name.padEnd(20)} -> ${statusText}`);
  
  if (!check.value && check.required) {
    hasErrors = true;
  }
  if (!check.value && !check.required) {
    hasWarnings = true;
  }
});

// Verificaciones específicas
console.log('\n📊 Análisis de configuración:\n');

const provider = getEnv('AI_PROVIDER') || 'groq';
console.log(`🤖 Proveedor de IA activo: ${provider.toUpperCase()}`);

if (provider === 'groq') {
  if (!getEnv('GROQ_API_KEY')) {
    console.log('❌ ERROR: AI_PROVIDER=groq pero no hay GROQ_API_KEY');
    hasErrors = true;
  } else {
    console.log('✅ GROQ_API_KEY configurado correctamente');
  }
  
  if (!getEnv('HF_TOKEN')) {
    console.log('⚠️  ADVERTENCIA: HF_TOKEN no configurado');
    console.log('   → Las imágenes se generarán como descripciones de texto');
    console.log('   → Para generar imágenes reales, configura HF_TOKEN');
    console.log('   → Obtén tu token en: https://huggingface.co/settings/tokens');
    hasWarnings = true;
  } else {
    console.log('✅ HF_TOKEN configurado');
    console.log('   → Imágenes: Groq (descripción) + Stable Diffusion (generación)');
  }
} else if (provider === 'openai') {
  if (!getEnv('OPENAI_API_KEY')) {
    console.log('❌ ERROR: AI_PROVIDER=openai pero no hay OPENAI_API_KEY');
    hasErrors = true;
  } else {
    console.log('✅ OPENAI_API_KEY configurado correctamente');
    console.log('   → Imágenes se generarán con DALL-E 3');
  }
}

// Resumen final
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ HAY ERRORES CRÍTICOS - Revisa tu archivo .env');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  CONFIGURACIÓN PARCIAL - Algunas funciones limitadas');
  console.log('   Puedes continuar pero considera agregar las variables opcionales');
  process.exit(0);
} else {
  console.log('✅ CONFIGURACIÓN COMPLETA - Todo está correcto');
  process.exit(0);
}
