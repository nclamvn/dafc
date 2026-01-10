#!/bin/bash
# =====================================================
# DAFC OTB Platform - Deploy Reporting Views to Render
# =====================================================
#
# This script deploys reporting views to your Render PostgreSQL database
#
# USAGE:
#   chmod +x deploy_reporting_views.sh
#   ./deploy_reporting_views.sh
#
# PREREQUISITES:
#   - psql client installed
#   - DATABASE_URL environment variable set (from Render)
#
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  DAFC OTB - Deploy Power BI Reporting Views    ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL environment variable is not set${NC}"
    echo ""
    echo "Please set it from your Render dashboard:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
    echo ""
    echo "Or provide it directly:"
    echo "  DATABASE_URL='your-connection-string' ./deploy_reporting_views.sh"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL is set${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ ERROR: psql client is not installed${NC}"
    echo ""
    echo "Install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${GREEN}✓ psql client found${NC}"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}⚠️  This will create reporting views in your database${NC}"
echo ""
read -p "Do you want to continue? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Deploying reporting views...${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SQL_FILE="$SCRIPT_DIR/01_reporting_views_v2.sql"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ ERROR: SQL file not found: $SQL_FILE${NC}"
    exit 1
fi

# Run the SQL script
echo "Running: psql \$DATABASE_URL -f $SQL_FILE"
echo ""

psql "$DATABASE_URL" -f "$SQL_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ DEPLOYMENT SUCCESSFUL!                     ${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "Reporting views created in schema: reporting"
    echo ""
    echo -e "${YELLOW}Power BI Connection Info:${NC}"
    echo "  Schema: reporting"
    echo "  User: powerbi_reader"
    echo "  Password: DAFC_PowerBI_2025! (change this!)"
    echo ""
    echo "Available views:"
    echo "  - reporting.dim_divisions"
    echo "  - reporting.dim_brands"
    echo "  - reporting.dim_categories"
    echo "  - reporting.dim_subcategories"
    echo "  - reporting.dim_locations"
    echo "  - reporting.dim_seasons"
    echo "  - reporting.dim_users"
    echo "  - reporting.dim_collections"
    echo "  - reporting.fact_budget_allocations"
    echo "  - reporting.fact_audit_logs"
    echo "  - reporting.agg_budget_by_brand_season"
    echo "  - reporting.agg_budget_by_location"
    echo "  - reporting.agg_user_activity"
    echo "  - reporting.agg_master_data_summary"
    echo "  - reporting.dim_date"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Change the powerbi_reader password!"
    echo "  2. Connect Power BI Desktop to PostgreSQL"
    echo "  3. Select tables from 'reporting' schema"
    echo ""
else
    echo ""
    echo -e "${RED}❌ DEPLOYMENT FAILED${NC}"
    echo "Check the error messages above."
    exit 1
fi
