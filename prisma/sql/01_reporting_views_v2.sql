-- =====================================================
-- DAFC OTB Platform - Power BI Reporting Views
-- Version: 2.0 - Aligned with actual Prisma schema
-- =====================================================
-- 
-- RUN THIS SCRIPT ON YOUR RENDER POSTGRESQL DATABASE:
-- psql $DATABASE_URL -f reporting_views.sql
--
-- =====================================================

-- =====================================================
-- PART 1: CREATE REPORTING SCHEMA AND USER
-- =====================================================

-- Create dedicated reporting schema
CREATE SCHEMA IF NOT EXISTS reporting;

-- Create read-only user for Power BI (change password!)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'powerbi_reader') THEN
        CREATE USER powerbi_reader WITH PASSWORD 'DAFC_PowerBI_2025!';
    END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA reporting TO powerbi_reader;
GRANT USAGE ON SCHEMA public TO powerbi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO powerbi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powerbi_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA reporting GRANT SELECT ON TABLES TO powerbi_reader;

-- =====================================================
-- PART 2: DIMENSION VIEWS (Reference/Master Data)
-- =====================================================

-- Divisions dimension
CREATE OR REPLACE VIEW reporting.dim_divisions AS
SELECT 
    id,
    name,
    code,
    description,
    "isActive" AS is_active,
    "sortOrder" AS sort_order,
    "createdAt" AS created_at,
    "updatedAt" AS updated_at
FROM public.divisions;

-- Brands dimension
CREATE OR REPLACE VIEW reporting.dim_brands AS
SELECT 
    b.id,
    b.name,
    b.code,
    b.description,
    b."logoUrl" AS logo_url,
    b."isActive" AS is_active,
    b."sortOrder" AS sort_order,
    b."divisionId" AS division_id,
    d.name AS division_name,
    d.code AS division_code,
    b."createdAt" AS created_at,
    b."updatedAt" AS updated_at
FROM public.brands b
LEFT JOIN public.divisions d ON b."divisionId" = d.id;

-- Categories dimension
CREATE OR REPLACE VIEW reporting.dim_categories AS
SELECT 
    id,
    name,
    code,
    description,
    "isActive" AS is_active,
    "sortOrder" AS sort_order,
    "createdAt" AS created_at,
    "updatedAt" AS updated_at
FROM public.categories;

-- Subcategories dimension
CREATE OR REPLACE VIEW reporting.dim_subcategories AS
SELECT 
    sc.id,
    sc.name,
    sc.code,
    sc.description,
    sc."isActive" AS is_active,
    sc."sortOrder" AS sort_order,
    sc."categoryId" AS category_id,
    c.name AS category_name,
    c.code AS category_code,
    sc."createdAt" AS created_at,
    sc."updatedAt" AS updated_at
FROM public.subcategories sc
LEFT JOIN public.categories c ON sc."categoryId" = c.id;

-- Locations dimension
CREATE OR REPLACE VIEW reporting.dim_locations AS
SELECT 
    id,
    name,
    code,
    type,
    address,
    "isActive" AS is_active,
    "sortOrder" AS sort_order,
    "createdAt" AS created_at,
    "updatedAt" AS updated_at
FROM public.sales_locations;

-- Seasons dimension
CREATE OR REPLACE VIEW reporting.dim_seasons AS
SELECT 
    id,
    name,
    code,
    "seasonGroup" AS season_group,
    year,
    "startDate" AS start_date,
    "endDate" AS end_date,
    "isActive" AS is_active,
    "isCurrent" AS is_current,
    "createdAt" AS created_at,
    "updatedAt" AS updated_at
FROM public.seasons;

-- Users dimension (sanitized - no password)
CREATE OR REPLACE VIEW reporting.dim_users AS
SELECT 
    id,
    email,
    name,
    role,
    status,
    avatar,
    "lastLoginAt" AS last_login_at,
    "createdAt" AS created_at,
    "updatedAt" AS updated_at
FROM public.users;

-- Collections dimension
CREATE OR REPLACE VIEW reporting.dim_collections AS
SELECT 
    c.id,
    c.name,
    c.code,
    c.description,
    c."isActive" AS is_active,
    c."sortOrder" AS sort_order,
    c."brandId" AS brand_id,
    b.name AS brand_name,
    b.code AS brand_code,
    c."createdAt" AS created_at,
    c."updatedAt" AS updated_at
FROM public.collections c
LEFT JOIN public.brands b ON c."brandId" = b.id;

-- =====================================================
-- PART 3: FACT VIEWS (Transactional Data)
-- =====================================================

-- Budget Allocations Fact
CREATE OR REPLACE VIEW reporting.fact_budget_allocations AS
SELECT 
    ba.id AS allocation_id,
    ba."seasonId" AS season_id,
    s.name AS season_name,
    s.code AS season_code,
    ba."brandId" AS brand_id,
    b.name AS brand_name,
    b.code AS brand_code,
    ba."locationId" AS location_id,
    l.name AS location_name,
    l.code AS location_code,
    ba."totalBudget" AS total_budget,
    ba."seasonalBudget" AS seasonal_budget,
    ba."replenishmentBudget" AS replenishment_budget,
    ba.currency,
    ba.status,
    ba.version,
    ba.comments,
    ba.assumptions,
    ba."createdById" AS created_by_id,
    uc.name AS created_by_name,
    ba."approvedById" AS approved_by_id,
    ua.name AS approved_by_name,
    ba."approvedAt" AS approved_at,
    ba."createdAt" AS created_at,
    ba."updatedAt" AS updated_at,
    -- Calculated fields
    EXTRACT(YEAR FROM ba."createdAt") AS created_year,
    EXTRACT(MONTH FROM ba."createdAt") AS created_month,
    EXTRACT(QUARTER FROM ba."createdAt") AS created_quarter
FROM public.budget_allocations ba
LEFT JOIN public.seasons s ON ba."seasonId" = s.id
LEFT JOIN public.brands b ON ba."brandId" = b.id
LEFT JOIN public.sales_locations l ON ba."locationId" = l.id
LEFT JOIN public.users uc ON ba."createdById" = uc.id
LEFT JOIN public.users ua ON ba."approvedById" = ua.id;

-- Audit Log Fact
CREATE OR REPLACE VIEW reporting.fact_audit_logs AS
SELECT 
    id,
    "tableName" AS table_name,
    "recordId" AS record_id,
    action,
    "oldValue" AS old_value,
    "newValue" AS new_value,
    "userId" AS user_id,
    "userEmail" AS user_email,
    "ipAddress" AS ip_address,
    "userAgent" AS user_agent,
    "createdAt" AS created_at,
    -- Calculated fields
    EXTRACT(YEAR FROM "createdAt") AS log_year,
    EXTRACT(MONTH FROM "createdAt") AS log_month,
    EXTRACT(DAY FROM "createdAt") AS log_day,
    TO_CHAR("createdAt", 'YYYY-MM-DD') AS log_date
FROM public.audit_logs;

-- =====================================================
-- PART 4: AGGREGATED VIEWS (Pre-calculated Summaries)
-- =====================================================

-- Budget Summary by Brand and Season
CREATE OR REPLACE VIEW reporting.agg_budget_by_brand_season AS
SELECT 
    b.id AS brand_id,
    b.name AS brand_name,
    b.code AS brand_code,
    d.name AS division_name,
    s.id AS season_id,
    s.name AS season_name,
    s.code AS season_code,
    COUNT(DISTINCT ba.id) AS allocation_count,
    SUM(ba."totalBudget") AS total_budget_sum,
    SUM(ba."seasonalBudget") AS seasonal_budget_sum,
    SUM(ba."replenishmentBudget") AS replenishment_budget_sum,
    AVG(ba."totalBudget") AS avg_budget,
    COUNT(DISTINCT CASE WHEN ba.status = 'APPROVED' THEN ba.id END) AS approved_count,
    COUNT(DISTINCT CASE WHEN ba.status = 'DRAFT' THEN ba.id END) AS draft_count,
    COUNT(DISTINCT CASE WHEN ba.status = 'SUBMITTED' THEN ba.id END) AS submitted_count,
    COUNT(DISTINCT ba."locationId") AS locations_count
FROM public.brands b
LEFT JOIN public.divisions d ON b."divisionId" = d.id
LEFT JOIN public.budget_allocations ba ON ba."brandId" = b.id
LEFT JOIN public.seasons s ON ba."seasonId" = s.id
GROUP BY b.id, b.name, b.code, d.name, s.id, s.name, s.code;

-- Budget Summary by Location
CREATE OR REPLACE VIEW reporting.agg_budget_by_location AS
SELECT 
    l.id AS location_id,
    l.name AS location_name,
    l.code AS location_code,
    l.type AS location_type,
    s.id AS season_id,
    s.name AS season_name,
    COUNT(DISTINCT ba.id) AS allocation_count,
    COUNT(DISTINCT ba."brandId") AS brands_count,
    SUM(ba."totalBudget") AS total_budget_sum,
    SUM(ba."seasonalBudget") AS seasonal_budget_sum,
    SUM(ba."replenishmentBudget") AS replenishment_budget_sum
FROM public.sales_locations l
LEFT JOIN public.budget_allocations ba ON ba."locationId" = l.id
LEFT JOIN public.seasons s ON ba."seasonId" = s.id
GROUP BY l.id, l.name, l.code, l.type, s.id, s.name;

-- User Activity Summary
CREATE OR REPLACE VIEW reporting.agg_user_activity AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    u.role,
    u.status,
    u."lastLoginAt" AS last_login_at,
    u."createdAt" AS user_created_at,
    COUNT(DISTINCT al.id) AS total_actions,
    COUNT(DISTINCT CASE WHEN al."createdAt" > NOW() - INTERVAL '7 days' THEN al.id END) AS actions_last_7_days,
    COUNT(DISTINCT CASE WHEN al."createdAt" > NOW() - INTERVAL '30 days' THEN al.id END) AS actions_last_30_days,
    MAX(al."createdAt") AS last_action_at,
    COUNT(DISTINCT CASE WHEN al.action = 'CREATE' THEN al.id END) AS create_actions,
    COUNT(DISTINCT CASE WHEN al.action = 'UPDATE' THEN al.id END) AS update_actions,
    COUNT(DISTINCT CASE WHEN al.action = 'DELETE' THEN al.id END) AS delete_actions
FROM public.users u
LEFT JOIN public.audit_logs al ON u.id = al."userId"
GROUP BY u.id, u.name, u.email, u.role, u.status, u."lastLoginAt", u."createdAt";

-- Master Data Summary
CREATE OR REPLACE VIEW reporting.agg_master_data_summary AS
SELECT 
    'Divisions' AS entity_type,
    COUNT(*) AS total_count,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) AS active_count
FROM public.divisions
UNION ALL
SELECT 
    'Brands',
    COUNT(*),
    COUNT(CASE WHEN "isActive" = true THEN 1 END)
FROM public.brands
UNION ALL
SELECT 
    'Categories',
    COUNT(*),
    COUNT(CASE WHEN "isActive" = true THEN 1 END)
FROM public.categories
UNION ALL
SELECT 
    'Subcategories',
    COUNT(*),
    COUNT(CASE WHEN "isActive" = true THEN 1 END)
FROM public.subcategories
UNION ALL
SELECT 
    'Locations',
    COUNT(*),
    COUNT(CASE WHEN "isActive" = true THEN 1 END)
FROM public.sales_locations
UNION ALL
SELECT 
    'Seasons',
    COUNT(*),
    COUNT(CASE WHEN "isActive" = true THEN 1 END)
FROM public.seasons
UNION ALL
SELECT 
    'Users',
    COUNT(*),
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)
FROM public.users;

-- =====================================================
-- PART 5: DATE DIMENSION (for Time Intelligence)
-- =====================================================

CREATE OR REPLACE VIEW reporting.dim_date AS
WITH date_series AS (
    SELECT generate_series(
        '2024-01-01'::date,
        '2026-12-31'::date,
        '1 day'::interval
    )::date AS date_value
)
SELECT 
    date_value AS date_key,
    date_value AS full_date,
    EXTRACT(YEAR FROM date_value) AS year,
    EXTRACT(QUARTER FROM date_value) AS quarter,
    EXTRACT(MONTH FROM date_value) AS month,
    EXTRACT(WEEK FROM date_value) AS week,
    EXTRACT(DAY FROM date_value) AS day,
    EXTRACT(DOW FROM date_value) AS day_of_week,
    TO_CHAR(date_value, 'YYYY-MM') AS year_month,
    TO_CHAR(date_value, 'YYYY-Q') AS year_quarter,
    TO_CHAR(date_value, 'Month') AS month_name,
    TO_CHAR(date_value, 'Mon') AS month_short,
    TO_CHAR(date_value, 'Day') AS day_name,
    TO_CHAR(date_value, 'Dy') AS day_short,
    CASE 
        WHEN EXTRACT(DOW FROM date_value) IN (0, 6) THEN true 
        ELSE false 
    END AS is_weekend,
    CASE 
        WHEN EXTRACT(MONTH FROM date_value) IN (1, 2, 3, 4, 5) THEN 'SS' 
        ELSE 'FW' 
    END AS season_group
FROM date_series;

-- =====================================================
-- PART 6: VERIFICATION QUERIES
-- =====================================================

-- List all views in reporting schema
-- Run this to verify views were created:
/*
SELECT 
    schemaname,
    viewname,
    'VIEW' AS type
FROM pg_views 
WHERE schemaname = 'reporting'
ORDER BY viewname;
*/

-- Test each view
/*
SELECT COUNT(*) AS divisions_count FROM reporting.dim_divisions;
SELECT COUNT(*) AS brands_count FROM reporting.dim_brands;
SELECT COUNT(*) AS categories_count FROM reporting.dim_categories;
SELECT COUNT(*) AS locations_count FROM reporting.dim_locations;
SELECT COUNT(*) AS seasons_count FROM reporting.dim_seasons;
SELECT COUNT(*) AS users_count FROM reporting.dim_users;
SELECT COUNT(*) AS budgets_count FROM reporting.fact_budget_allocations;
SELECT * FROM reporting.agg_master_data_summary;
*/

-- =====================================================
-- USAGE INSTRUCTIONS FOR POWER BI
-- =====================================================
/*
1. Connect Power BI Desktop to PostgreSQL:
   - Get Data → PostgreSQL database
   - Server: your-render-db-host.oregon-postgres.render.com
   - Database: your_database_name
   - User: powerbi_reader
   - Password: DAFC_PowerBI_2025!

2. Select tables from 'reporting' schema:
   - dim_brands
   - dim_categories
   - dim_locations
   - dim_seasons
   - dim_users
   - fact_budget_allocations
   - agg_budget_by_brand_season
   - dim_date

3. Create relationships in Power BI:
   - fact_budget_allocations[brand_id] → dim_brands[id]
   - fact_budget_allocations[season_id] → dim_seasons[id]
   - fact_budget_allocations[location_id] → dim_locations[id]
   - fact_budget_allocations[created_by_id] → dim_users[id]

4. Recommended DAX Measures:
   
   Total Budget = SUM(fact_budget_allocations[total_budget])
   
   Approved Budget = CALCULATE(
       SUM(fact_budget_allocations[total_budget]),
       fact_budget_allocations[status] = "APPROVED"
   )
   
   Brand Count = DISTINCTCOUNT(dim_brands[id])
   
   Active Brands = CALCULATE(
       DISTINCTCOUNT(dim_brands[id]),
       dim_brands[is_active] = TRUE
   )
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Reporting views created successfully!';
    RAISE NOTICE 'Schema: reporting';
    RAISE NOTICE 'User: powerbi_reader';
    RAISE NOTICE 'Password: DAFC_PowerBI_2025! (CHANGE THIS!)';
END
$$;
