#!/bin/bash

# Script para probar el webhook de Facebook localmente

echo "🧪 Probando Webhook de Facebook/Meta"
echo "======================================"
echo ""

# Configuración
WEBHOOK_URL="http://localhost:3000/api/meta/webhook"
VERIFY_TOKEN="mi_token_seguro_123"  # Cambiar por tu token

echo "📍 URL del Webhook: $WEBHOOK_URL"
echo ""

# Test 1: Verificación GET
echo "Test 1️⃣: Verificación de Webhook (GET)"
echo "-------------------------------------"
curl -X GET "${WEBHOOK_URL}?hub.verify_token=${VERIFY_TOKEN}&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"
echo ""
echo ""

# Test 2: Recepción de Mensaje POST
echo "Test 2️⃣: Recepción de Mensaje (POST)"
echo "-------------------------------------"
curl -H "Content-Type: application/json" \
     -X POST "${WEBHOOK_URL}" \
     -d '{
       "object": "page",
       "entry": [{
         "id": "PAGE_ID",
         "time": 1458692752478,
         "messaging": [{
           "sender": {"id": "USER_ID_123"},
           "recipient": {"id": "PAGE_ID"},
           "timestamp": 1458692752478,
           "message": {
             "mid": "mid.1457764197618:41d102a3e1ae206a38",
             "text": "Hola, esto es un mensaje de prueba"
           }
         }]
       }]
     }'
echo ""
echo ""

echo "✅ Pruebas completadas"
echo ""
echo "Resultados esperados:"
echo "  Test 1: Debe mostrar 'CHALLENGE_ACCEPTED'"
echo "  Test 2: Debe mostrar 'EVENT_RECEIVED'"
echo ""
echo "Revisa la consola del servidor para ver los logs detallados"
