-- =====================================================
-- DAFC OTB Platform - Fix Invalid Enum Values
-- =====================================================
-- 
-- This migration fixes data that contains invalid enum values
-- that don't match the Prisma schema definitions.
--
-- Run: psql $DATABASE_URL -f fix_invalid_enums.sql
--
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Check current invalid values
-- =====================================================

-- Check OTBPlan statuses
SELECT 'OTBPlan' as table_name, status, COUNT(*) as count
FROM "OTBPlan"
GROUP BY status
ORDER BY status;

-- Check SKUProposal statuses  
SELECT 'SKUProposal' as table_name, status, COUNT(*) as count
FROM "SKUProposal"
GROUP BY status
ORDER BY status;

-- Check BudgetAllocation statuses and versions
SELECT 'BudgetAllocation' as table_name, status, COUNT(*) as count
FROM "BudgetAllocation"
GROUP BY status
ORDER BY status;

-- =====================================================
-- STEP 2: Fix OTBPlan invalid statuses
-- =====================================================

-- Map REVISED -> DRAFT (safest default for editing)
UPDATE "OTBPlan"
SET status = 'DRAFT', 
    "updatedAt" = NOW(),
    notes = COALESCE(notes, '') || E'\n[Auto-migrated from REVISED status on ' || NOW()::date || ']'
WHERE status = 'REVISED';

-- Map any other invalid status to DRAFT
UPDATE "OTBPlan"
SET status = 'DRAFT',
    "updatedAt" = NOW()
WHERE status NOT IN (
    'DRAFT', 'IN_PROGRESS', 'SUBMITTED', 
    'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'
);

-- =====================================================
-- STEP 3: Fix SKUProposal invalid statuses
-- =====================================================

-- Map REVISED -> DRAFT
UPDATE "SKUProposal"
SET status = 'DRAFT',
    "updatedAt" = NOW()
WHERE status = 'REVISED';

-- Map any other invalid status to DRAFT
UPDATE "SKUProposal"
SET status = 'DRAFT',
    "updatedAt" = NOW()
WHERE status NOT IN (
    'DRAFT', 'SUBMITTED', 'APPROVED', 
    'REJECTED', 'CANCELLED'
);

-- =====================================================
-- STEP 4: Fix BudgetAllocation invalid values
-- =====================================================

-- Fix invalid status values
UPDATE "BudgetAllocation"
SET status = 'DRAFT',
    "updatedAt" = NOW()
WHERE status NOT IN (
    'ACTIVE', 'DRAFT', 'APPROVED', 'CLOSED'
) OR status IS NULL;

-- Fix invalid version values (REVISED -> V2_ADJUSTED)
UPDATE "BudgetAllocation"
SET version = 'V2_ADJUSTED',
    "updatedAt" = NOW()
WHERE version = 'REVISED';

-- Fix any other invalid version
UPDATE "BudgetAllocation"
SET version = 'V0_SYSTEM',
    "updatedAt" = NOW()
WHERE version NOT IN (
    'V0_SYSTEM', 'V1_USER', 'V2_ADJUSTED',
    'V3_REVIEWED', 'VA_APPROVED', 'VF_FINAL'
);

-- =====================================================
-- STEP 5: Verify fixes
-- =====================================================

SELECT '--- After Migration ---' as info;

SELECT 'OTBPlan' as table_name, status, COUNT(*) as count
FROM "OTBPlan"
GROUP BY status
ORDER BY status;

SELECT 'SKUProposal' as table_name, status, COUNT(*) as count
FROM "SKUProposal"
GROUP BY status
ORDER BY status;

SELECT 'BudgetAllocation status' as field, status as value, COUNT(*) as count
FROM "BudgetAllocation"
GROUP BY status
ORDER BY status;

SELECT 'BudgetAllocation version' as field, version as value, COUNT(*) as count
FROM "BudgetAllocation"
GROUP BY version
ORDER BY version;

-- =====================================================
-- STEP 6: Create indexes for enum columns (if not exists)
-- =====================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_otb_status 
ON "OTBPlan" (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sku_status 
ON "SKUProposal" (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_status 
ON "BudgetAllocation" (status);

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 'Migration completed successfully!' as result;
