#!/bin/bash

# Script de teste da autenticação RX Nation
# Execute este script após configurar o banco de dados

set -e

echo "🧪 Teste de Autenticação RX Nation"
echo "=================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/auth"
TEST_EMAIL="teste@rxnation.com"
TEST_PASSWORD="senha123"
TEST_NAME="Atleta Teste"

echo "📋 Configuração:"
echo "   Base URL: $BASE_URL"
echo "   Email de teste: $TEST_EMAIL"
echo ""

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "🔍 Testando $name... "
    
    response=$(curl -s -w "\n%{http_code}" -X $method \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$endpoint" 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK (HTTP $http_code)${NC}"
        echo "   Resposta: $body"
        return 0
    else
        echo -e "${RED}✗ FALHOU (HTTP $http_code)${NC}"
        echo "   Erro: $body"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  TESTE DE REGISTRO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Registro de novo usuário" \
    "POST" \
    "$API_URL/register" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  TESTE DE LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Salvar cookies para próximos testes
COOKIE_FILE=$(mktemp)

echo -n "🔍 Testando login... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c "$COOKIE_FILE" \
    "$API_URL/login" 2>&1)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ OK (HTTP $http_code)${NC}"
    echo "   Resposta: $body"
    echo "   Cookie salvo: $COOKIE_FILE"
else
    echo -e "${RED}✗ FALHOU (HTTP $http_code)${NC}"
    echo "   Erro: $body"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  TESTE DE RECUPERAÇÃO DE SENHA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Solicitação de recuperação de senha" \
    "POST" \
    "$API_URL/forgot-password" \
    "{\"email\":\"$TEST_EMAIL\"}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  TESTE DE VALIDAÇÕES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Testando senha fraca (deve falhar)..."
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"fraca@test.com\",\"password\":\"123\",\"name\":\"Teste\"}" \
    "$API_URL/register" 2>&1)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -ge 400 ]; then
    echo -e "${GREEN}✓ Validação funcionando (HTTP $http_code)${NC}"
    echo "   Erro esperado: $body"
else
    echo -e "${RED}✗ Validação não funcionou (HTTP $http_code)${NC}"
fi

echo ""
echo "🔍 Testando email duplicado (deve falhar)..."
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Duplicado\"}" \
    "$API_URL/register" 2>&1)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -ge 400 ]; then
    echo -e "${GREEN}✓ Validação funcionando (HTTP $http_code)${NC}"
    echo "   Erro esperado: $body"
else
    echo -e "${RED}✗ Validação não funcionou (HTTP $http_code)${NC}"
fi

echo ""
echo "🔍 Testando login com senha errada (deve falhar)..."
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"senhaerrada123\"}" \
    "$API_URL/login" 2>&1)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -ge 400 ]; then
    echo -e "${GREEN}✓ Validação funcionando (HTTP $http_code)${NC}"
    echo "   Erro esperado: $body"
else
    echo -e "${RED}✗ Validação não funcionou (HTTP $http_code)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  TESTE DE LOGOUT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -n "🔍 Testando logout... "
response=$(curl -s -w "\n%{http_code}" -X POST \
    -b "$COOKIE_FILE" \
    "$API_URL/logout" 2>&1)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "${GREEN}✓ OK (HTTP $http_code)${NC}"
    echo "   Resposta: $body"
else
    echo -e "${RED}✗ FALHOU (HTTP $http_code)${NC}"
    echo "   Erro: $body"
fi

# Limpar arquivo temporário
rm -f "$COOKIE_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TESTES CONCLUÍDOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 Verifique seu email ($TEST_EMAIL) para:"
echo "   - Email de boas-vindas"
echo "   - Email de recuperação de senha"
echo ""
echo "🌐 Teste manual no navegador:"
echo "   - Registro: $BASE_URL/register"
echo "   - Login: $BASE_URL/login"
echo "   - Recuperação: $BASE_URL/forgot-password"
echo ""
