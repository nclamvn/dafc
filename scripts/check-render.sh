#!/bin/bash
# DAFC OTB Platform - Health Check Script
# Usage: ./check-render.sh

BASE_URL="https://dafc-otb-platform.onrender.com"

echo "🔍 DAFC OTB Platform - Health Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Health Endpoint
echo "1️⃣  Testing Health Endpoint..."
start=$(date +%s%N)
health_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/v1/health" --connect-timeout 60 --max-time 90)
end=$(date +%s%N)
http_code=$(echo "$health_response" | tail -n1)
body=$(echo "$health_response" | sed '$d')
duration=$(( (end - start) / 1000000 ))

if [ "$http_code" = "200" ]; then
    echo -e "   ${GREEN}✅ Health: OK${NC} (${duration}ms)"
    if [ $duration -gt 5000 ]; then
        echo -e "   ${YELLOW}⚠️  Cold start detected (>5s)${NC}"
    fi
else
    echo -e "   ${RED}❌ Health: FAILED (HTTP $http_code)${NC}"
fi
echo ""

# Test AI Endpoint
echo "2️⃣  Testing AI Endpoint..."
ai_response=$(curl -s "$BASE_URL/api/ai/test" --connect-timeout 30)
has_key=$(echo "$ai_response" | grep -o '"hasKey":[^,]*' | cut -d':' -f2)
status=$(echo "$ai_response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$status" = "success" ]; then
    echo -e "   ${GREEN}✅ AI: Working${NC}"
elif [ "$has_key" = "false" ]; then
    echo -e "   ${RED}❌ AI: OPENAI_API_KEY not configured${NC}"
    echo "   → Go to Render Dashboard → Environment → Add OPENAI_API_KEY"
else
    echo -e "   ${YELLOW}⚠️  AI: $status${NC}"
    echo "   Response: $ai_response"
fi
echo ""

# Test Auth Endpoint
echo "3️⃣  Testing Auth Endpoint..."
auth_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/providers" --connect-timeout 10)
if [ "$auth_response" = "200" ]; then
    echo -e "   ${GREEN}✅ Auth: OK${NC}"
else
    echo -e "   ${RED}❌ Auth: FAILED (HTTP $auth_response)${NC}"
fi
echo ""

# Summary
echo "======================================"
echo "🌐 App URL: $BASE_URL"
echo "📊 Dashboard: $BASE_URL/dashboard"
echo "🔐 Login: admin@dafc.com / admin123"
echo ""
echo "💡 Tips:"
echo "   - If slow, set up keep-alive cron job"
echo "   - If AI fails, add OPENAI_API_KEY on Render"
echo "======================================"
