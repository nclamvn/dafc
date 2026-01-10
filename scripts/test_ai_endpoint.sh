#!/bin/bash
# =====================================================
# DAFC OTB Platform - Test AI Endpoint
# =====================================================

set -e

BASE_URL="${1:-https://dafc-otb-platform.onrender.com}"
TIMEOUT=120

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DAFC OTB Platform - AI Endpoint Test                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Target: $BASE_URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Test 1: Health Check
echo -e "${BLUE}[1/3] Testing Health Endpoint...${NC}"
HEALTH=$(curl -s --connect-timeout 60 --max-time $TIMEOUT "$BASE_URL/api/v1/health" 2>&1)

if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    echo -e "${GREEN}  ✓ Health: OK${NC}"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null | head -10 || echo "$HEALTH"
else
    echo -e "${YELLOW}  ⚠ Health endpoint không phản hồi (có thể đang cold start)${NC}"
    echo "  Chờ 30 giây và thử lại..."
    sleep 30
    HEALTH=$(curl -s --connect-timeout 60 --max-time $TIMEOUT "$BASE_URL/api/v1/health" 2>&1)
    if echo "$HEALTH" | grep -q '"status"'; then
        echo -e "${GREEN}  ✓ Health: OK (sau khi warm up)${NC}"
    else
        echo -e "${RED}  ✗ Health: FAILED${NC}"
        echo "  Response: $HEALTH"
    fi
fi

echo ""

# Test 2: AI Test Endpoint
echo -e "${BLUE}[2/3] Testing AI Test Endpoint...${NC}"
AI_TEST=$(curl -s --connect-timeout 30 --max-time 60 "$BASE_URL/api/ai/test" 2>&1)

if echo "$AI_TEST" | grep -q '"status":"success"'; then
    echo -e "${GREEN}  ✓ AI Endpoint: WORKING${NC}"
    echo "$AI_TEST" | python3 -m json.tool 2>/dev/null || echo "$AI_TEST"
elif echo "$AI_TEST" | grep -q '"hasKey":true'; then
    echo -e "${YELLOW}  ⚠ AI Key configured but test failed${NC}"
    echo "$AI_TEST" | python3 -m json.tool 2>/dev/null || echo "$AI_TEST"
elif echo "$AI_TEST" | grep -q '"hasKey":false'; then
    echo -e "${RED}  ✗ OPENAI_API_KEY chưa được configure${NC}"
    echo ""
    echo "  Để fix:"
    echo "    1. Vào Render Dashboard"
    echo "    2. Environment → Add OPENAI_API_KEY"
    echo "    3. Save và đợi redeploy"
elif echo "$AI_TEST" | grep -q "404"; then
    echo -e "${RED}  ✗ AI Endpoint chưa được deploy (404)${NC}"
    echo ""
    echo "  Cần tạo file: app/api/ai/test/route.ts"
else
    echo -e "${YELLOW}  ? Không xác định được status${NC}"
    echo "  Response: $AI_TEST"
fi

echo ""

# Test 3: API Endpoints
echo -e "${BLUE}[3/3] Testing API Endpoints...${NC}"

endpoints=(
    "/api/v1/brands"
    "/api/v1/categories"
    "/api/v1/seasons"
)

for endpoint in "${endpoints[@]}"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$BASE_URL$endpoint" 2>&1)
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ]; then
        echo -e "${GREEN}  ✓ $endpoint: $RESPONSE${NC}"
    elif [ "$RESPONSE" = "404" ]; then
        echo -e "${YELLOW}  ⚠ $endpoint: 404 (not deployed)${NC}"
    else
        echo -e "${RED}  ✗ $endpoint: $RESPONSE${NC}"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test hoàn tất${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
