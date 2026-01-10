-- prisma/migrations/add_performance_indexes.sql
-- DAFC OTB Platform - Performance Indexes
-- Run: psql $DATABASE_URL -f add_performance_indexes.sql

-- =====================================================
-- BUDGET ALLOCATION INDEXES
-- =====================================================

-- Most common query: filter by brand + season
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_brand_season 
ON "BudgetAllocation" ("brandId", "seasonId");

-- Filter by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_status 
ON "BudgetAllocation" ("status");

-- Composite for dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_brand_season_status 
ON "BudgetAllocation" ("brandId", "seasonId", "status");

-- =====================================================
-- OTB PLAN INDEXES
-- =====================================================

-- Common filter: brand + season + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_otb_brand_season_status 
ON "OTBPlan" ("brandId", "seasonId", "status");

-- Date range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_otb_created 
ON "OTBPlan" ("createdAt" DESC);

-- =====================================================
-- SKU PROPOSAL INDEXES
-- =====================================================

-- Most common: by OTB plan
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sku_otb_plan 
ON "SKUProposal" ("otbPlanId");

-- Filter by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sku_status 
ON "SKUProposal" ("status");

-- Composite for listing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sku_otb_status 
ON "SKUProposal" ("otbPlanId", "status");

-- Search by SKU code
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sku_code 
ON "SKUProposal" ("skuCode");

-- =====================================================
-- AUDIT LOG INDEXES
-- =====================================================

-- Common query: by entity type + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_entity_created 
ON "AuditLog" ("entityType", "createdAt" DESC);

-- User activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user_created 
ON "AuditLog" ("userId", "createdAt" DESC);

-- =====================================================
-- MASTER DATA INDEXES
-- =====================================================

-- Brands - active filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_active 
ON "Brand" ("isActive") WHERE "isActive" = true;

-- Categories by division
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_division 
ON "Category" ("divisionId", "isActive");

-- Subcategories by category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subcategories_category 
ON "Subcategory" ("categoryId", "isActive");

-- Locations active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_locations_active 
ON "Location" ("isActive") WHERE "isActive" = true;

-- Seasons active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seasons_active 
ON "Season" ("isActive", "startDate" DESC);

-- =====================================================
-- VERIFY INDEXES
-- =====================================================

-- List all indexes created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
