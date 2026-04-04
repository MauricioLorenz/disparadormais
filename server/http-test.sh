#!/bin/bash

# Script de teste HTTP para disparar ofertas via API
# Uso: ./http-test.sh

BASE_URL="http://localhost:3001"

echo "🚀 Iniciando testes HTTP de ofertas..."
echo ""

# ============================================
# 1️⃣ CRIAR CLIENTE
# ============================================
echo "1️⃣ Criando cliente..."
CLIENTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/clientes" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente Teste CURL",
    "telefone": "5548999999999",
    "estados_interesse": "SP, RJ, MG",
    "cache_tier": ["$$", "$$$"],
    "ativo": true
  }')

echo "Response: $CLIENTE_RESPONSE"
echo ""

# ============================================
# 2️⃣ LISTAR CLIENTES
# ============================================
echo "2️⃣ Listando clientes..."
curl -s -X GET "$BASE_URL/api/clientes" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# ============================================
# 3️⃣ DISPARAR OFERTA
# ============================================
echo "3️⃣ Disparando oferta..."
DATA_HOJE=$(date +%Y-%m-%d)

curl -s -X POST "$BASE_URL/api/ofertas" \
  -H "Content-Type: application/json" \
  -d "{
    \"artista\": \"Gusttavo Lima\",
    \"data\": \"$DATA_HOJE\",
    \"estados\": \"SP, RJ, MG\",
    \"cache_medio\": 150000
  }" | jq '.'
echo ""

# ============================================
# 4️⃣ DISPARAR MÚLTIPLAS OFERTAS
# ============================================
echo "4️⃣ Disparando múltiplas ofertas..."
echo ""

# Oferta 1
echo "  • Maiara & Maraisa..."
curl -s -X POST "$BASE_URL/api/ofertas" \
  -H "Content-Type: application/json" \
  -d "{
    \"artista\": \"Maiara & Maraisa\",
    \"data\": \"$DATA_HOJE\",
    \"estados\": \"RS, SC\",
    \"cache_medio\": 100000
  }" > /dev/null
echo "    ✅ Enviado"

# Oferta 2
echo "  • Zé Neto & Cristiano..."
curl -s -X POST "$BASE_URL/api/ofertas" \
  -H "Content-Type: application/json" \
  -d "{
    \"artista\": \"Zé Neto & Cristiano\",
    \"data\": \"$DATA_HOJE\",
    \"estados\": \"SP, RJ\",
    \"cache_medio\": 200000
  }" > /dev/null
echo "    ✅ Enviado"

# Oferta 3
echo "  • Wesley Safadão..."
curl -s -X POST "$BASE_URL/api/ofertas" \
  -H "Content-Type: application/json" \
  -d "{
    \"artista\": \"Wesley Safadão\",
    \"data\": \"$DATA_HOJE\",
    \"estados\": \"BA, PE, CE\",
    \"cache_medio\": 80000
  }" > /dev/null
echo "    ✅ Enviado"

echo ""

# ============================================
# 5️⃣ LISTAR OFERTAS
# ============================================
echo "5️⃣ Listando ofertas..."
curl -s -X GET "$BASE_URL/api/ofertas" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# ============================================
# 6️⃣ LISTAR DISPAROS
# ============================================
echo "6️⃣ Listando disparos..."
curl -s -X GET "$BASE_URL/api/disparos" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "✅ Testes concluídos com sucesso!"
