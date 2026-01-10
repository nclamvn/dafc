#!/bin/bash
# =====================================================
# DAFC OTB Platform - Deploy SQL Reporting Views
# =====================================================
#
# Chạy script này để deploy reporting views lên Render PostgreSQL
#
# CÁCH DÙNG:
#   chmod +x deploy_sql_views.sh
#   ./deploy_sql_views.sh
#
# HOẶC chạy trực tiếp:
#   psql $DATABASE_URL -f docs/powerbi/01_reporting_views_v2.sql
#
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DAFC OTB Platform - Deploy SQL Reporting Views          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL không được set${NC}"
    echo ""
    echo "Lấy DATABASE_URL từ Render Dashboard:"
    echo "  1. Vào https://dashboard.render.com"
    echo "  2. Chọn PostgreSQL instance"
    echo "  3. Copy 'External Database URL'"
    echo ""
    echo "Sau đó chạy:"
    echo "  export DATABASE_URL='postgresql://...'"
    echo "  ./deploy_sql_views.sh"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL đã set${NC}"

# Check psql
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ ERROR: psql chưa được cài đặt${NC}"
    echo ""
    echo "Cài đặt PostgreSQL client:"
    echo "  macOS:  brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${GREEN}✓ psql client found${NC}"

# Find SQL file
SQL_FILE=""
if [ -f "docs/powerbi/01_reporting_views_v2.sql" ]; then
    SQL_FILE="docs/powerbi/01_reporting_views_v2.sql"
elif [ -f "01_reporting_views_v2.sql" ]; then
    SQL_FILE="01_reporting_views_v2.sql"
elif [ -f "../01_reporting_views_v2.sql" ]; then
    SQL_FILE="../01_reporting_views_v2.sql"
else
    echo -e "${RED}❌ ERROR: Không tìm thấy file SQL${NC}"
    echo "Đảm bảo file 01_reporting_views_v2.sql tồn tại"
    exit 1
fi

echo -e "${GREEN}✓ SQL file: $SQL_FILE${NC}"
echo ""

# Confirm
echo -e "${YELLOW}⚠️  Script sẽ tạo:${NC}"
echo "   - Schema: reporting"
echo "   - User: powerbi_reader"
echo "   - 15+ views (dim_*, fact_*, agg_*)"
echo ""
read -p "Tiếp tục? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Đã hủy."
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Đang deploy...${NC}"
echo ""

# Run SQL
psql "$DATABASE_URL" -f "$SQL_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ DEPLOY THÀNH CÔNG!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Verify
    echo -e "${BLUE}📋 Kiểm tra views đã tạo:${NC}"
    echo ""
    psql "$DATABASE_URL" -c "SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'reporting' ORDER BY viewname;" 2>/dev/null
    
    echo ""
    echo -e "${BLUE}📊 Thống kê:${NC}"
    psql "$DATABASE_URL" -c "SELECT * FROM reporting.agg_master_data_summary;" 2>/dev/null
    
    echo ""
    echo -e "${GREEN}Tiếp theo:${NC}"
    echo "  1. Mở Power BI Desktop"
    echo "  2. Get Data → PostgreSQL"
    echo "  3. Chọn schema 'reporting'"
    echo "  4. Import các views"
    echo ""
else
    echo ""
    echo -e "${RED}❌ DEPLOY THẤT BẠI${NC}"
    echo "Kiểm tra lỗi ở trên."
    exit 1
fi
