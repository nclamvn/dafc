-- =====================================================
-- DAFC OTB Platform - Power BI Reporting Database Setup
-- =====================================================
-- This script creates all necessary database objects 
-- for Power BI integration
-- =====================================================

-- =====================================================
-- PART 1: SCHEMA AND USER SETUP
-- =====================================================

-- Create dedicated reporting schema
CREATE SCHEMA IF NOT EXISTS reporting;

-- Create read-only user for Power BI
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'powerbi_reader') THEN
        CREATE USER powerbi_reader WITH PASSWORD 'CHANGE_THIS_PASSWORD';
    END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA reporting TO powerbi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO powerbi_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA reporting GRANT SELECT ON TABLES TO powerbi_reader;

-- Allow connection to database
GRANT CONNECT ON DATABASE dafc_otb_production TO powerbi_reader;

-- =====================================================
-- PART 2: DIMENSION VIEWS (Reference Data)
-- =====================================================

-- Brands dimension
CREATE OR REPLACE VIEW reporting.dim_brands AS
SELECT 
    id,
    code,
    name,
    description,
    is_active,
    created_at,
    updated_at
FROM brands
WHERE deleted_at IS NULL;

-- Categories dimension
CREATE OR REPLACE VIEW reporting.dim_categories AS
SELECT 
    id,
    code,
    name,
    description,
    parent_id,
    level,
    is_active,
    created_at
FROM categories
WHERE deleted_at IS NULL;

-- Subcategories dimension
CREATE OR REPLACE VIEW reporting.dim_subcategories AS
SELECT 
    sc.id,
    sc.code,
    sc.name,
    sc.category_id,
    c.name AS category_name,
    sc.is_active,
    sc.created_at
FROM subcategories sc
LEFT JOIN categories c ON sc.category_id = c.id
WHERE sc.deleted_at IS NULL;

-- Locations dimension
CREATE OR REPLACE VIEW reporting.dim_locations AS
SELECT 
    id,
    code,
    name,
    type,
    region,
    address,
    is_active,
    created_at
FROM locations
WHERE deleted_at IS NULL;

-- Seasons dimension
CREATE OR REPLACE VIEW reporting.dim_seasons AS
SELECT 
    id,
    code,
    name,
    year,
    start_date,
    end_date,
    is_current,
    is_active,
    created_at
FROM seasons
WHERE deleted_at IS NULL;

-- Users dimension (sanitized)
CREATE OR REPLACE VIEW reporting.dim_users AS
SELECT 
    u.id,
    u.name,
    u.email,
    r.name AS role_name,
    r.code AS role_code,
    u.department,
    u.is_active,
    u.last_login_at,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.deleted_at IS NULL;

-- =====================================================
-- PART 3: FACT VIEWS (Transactional Data)
-- =====================================================

-- SKU Performance Fact
CREATE OR REPLACE VIEW reporting.fact_sku_performance AS
SELECT 
    s.id AS sku_id,
    s.sku_code,
    s.product_name,
    s.brand_id,
    s.category_id,
    s.subcategory_id,
    s.season_id,
    s.proposal_id,
    s.color_code,
    s.color_name,
    s.material,
    s.unit_cost,
    s.retail_price,
    s.wholesale_price,
    CASE 
        WHEN s.retail_price > 0 
        THEN ROUND((s.retail_price - s.unit_cost) / s.retail_price * 100, 2)
        ELSE 0 
    END AS margin_percent,
    s.total_quantity,
    s.total_cost,
    s.total_retail,
    s.status,
    s.created_at,
    s.updated_at,
    EXTRACT(YEAR FROM s.created_at) AS created_year,
    EXTRACT(MONTH FROM s.created_at) AS created_month,
    EXTRACT(WEEK FROM s.created_at) AS created_week
FROM sku_items s
WHERE s.deleted_at IS NULL;

-- Budget Allocation Fact
CREATE OR REPLACE VIEW reporting.fact_budget_allocation AS
SELECT 
    ba.id AS allocation_id,
    ba.brand_id,
    ba.location_id,
    ba.season_id,
    ba.category_id,
    ba.budget_type,
    ba.allocated_amount,
    ba.spent_amount,
    ba.remaining_amount,
    CASE 
        WHEN ba.allocated_amount > 0 
        THEN ROUND(ba.spent_amount / ba.allocated_amount * 100, 2)
        ELSE 0 
    END AS utilization_percent,
    ba.status,
    ba.approved_by,
    ba.approved_at,
    ba.created_at,
    ba.updated_at,
    EXTRACT(YEAR FROM ba.created_at) AS fiscal_year,
    EXTRACT(QUARTER FROM ba.created_at) AS fiscal_quarter
FROM budget_allocations ba
WHERE ba.deleted_at IS NULL;

-- OTB Analysis Fact
CREATE OR REPLACE VIEW reporting.fact_otb_analysis AS
SELECT 
    o.id AS otb_id,
    o.brand_id,
    o.category_id,
    o.subcategory_id,
    o.season_id,
    o.location_id,
    o.hierarchy_level,
    o.parent_id,
    o.historical_percent,
    o.system_proposed_percent,
    o.user_buy_percent,
    (o.user_buy_percent - o.historical_percent) AS variance_from_historical,
    (o.user_buy_percent - o.system_proposed_percent) AS variance_from_proposed,
    o.total_units,
    o.total_value,
    o.ai_recommendation,
    o.ai_confidence_score,
    o.status,
    o.created_at,
    o.updated_at
FROM otb_analysis o
WHERE o.deleted_at IS NULL;

-- Historical Sales Fact
CREATE OR REPLACE VIEW reporting.fact_historical_sales AS
SELECT 
    hs.id,
    hs.brand_id,
    hs.category_id,
    hs.subcategory_id,
    hs.location_id,
    hs.season_id,
    hs.sku_id,
    hs.period_start,
    hs.period_end,
    hs.units_sold,
    hs.units_ordered,
    CASE 
        WHEN hs.units_ordered > 0 
        THEN ROUND(hs.units_sold::DECIMAL / hs.units_ordered * 100, 2)
        ELSE 0 
    END AS sell_through_percent,
    hs.revenue,
    hs.cost,
    hs.gross_margin,
    CASE 
        WHEN hs.revenue > 0 
        THEN ROUND(hs.gross_margin / hs.revenue * 100, 2)
        ELSE 0 
    END AS margin_percent,
    hs.discount_amount,
    hs.stockout_days,
    hs.stockout_rate,
    hs.avg_selling_price,
    EXTRACT(YEAR FROM hs.period_start) AS sales_year,
    EXTRACT(MONTH FROM hs.period_start) AS sales_month,
    EXTRACT(WEEK FROM hs.period_start) AS sales_week,
    TO_CHAR(hs.period_start, 'YYYY-MM') AS year_month,
    hs.created_at
FROM historical_sales hs
WHERE hs.deleted_at IS NULL;

-- Size Distribution Fact
CREATE OR REPLACE VIEW reporting.fact_size_distribution AS
SELECT 
    sd.id,
    sd.sku_id,
    s.brand_id,
    s.category_id,
    s.season_id,
    sd.size_code,
    sd.quantity,
    sd.percentage,
    sd.historical_sell_through,
    CASE 
        WHEN sd.size_code IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') THEN 'Apparel'
        WHEN sd.size_code ~ '^[0-9]+(\.[0-9]+)?$' THEN 'Footwear'
        WHEN sd.size_code IN ('One Size', 'OS', 'OSFA') THEN 'One Size'
        ELSE 'Other'
    END AS size_category,
    sd.created_at
FROM size_distributions sd
LEFT JOIN sku_items s ON sd.sku_id = s.id
WHERE sd.deleted_at IS NULL;

-- Workflow Tracking Fact
CREATE OR REPLACE VIEW reporting.fact_workflow AS
SELECT 
    wi.id AS instance_id,
    wi.workflow_type,
    wi.entity_type,
    wi.entity_id,
    wi.current_step,
    wi.total_steps,
    wi.status AS workflow_status,
    wi.created_by,
    wi.assigned_to,
    wi.due_date,
    wi.started_at,
    wi.completed_at,
    CASE 
        WHEN wi.due_date < NOW() AND wi.status = 'pending' THEN 'Overdue'
        WHEN wi.due_date < NOW() + INTERVAL '2 days' AND wi.status = 'pending' THEN 'Due Soon'
        WHEN wi.status = 'completed' THEN 'Completed'
        WHEN wi.status = 'rejected' THEN 'Rejected'
        ELSE 'On Track'
    END AS urgency_status,
    EXTRACT(EPOCH FROM (COALESCE(wi.completed_at, NOW()) - wi.started_at)) / 3600 AS hours_in_workflow,
    EXTRACT(DAY FROM (COALESCE(wi.completed_at, NOW()) - wi.started_at)) AS days_in_workflow,
    wi.created_at
FROM workflow_instances wi
WHERE wi.deleted_at IS NULL;

-- =====================================================
-- PART 4: AGGREGATED VIEWS (Pre-calculated Summaries)
-- =====================================================

-- SKU Summary by Brand and Season
CREATE OR REPLACE VIEW reporting.agg_sku_by_brand_season AS
SELECT 
    b.id AS brand_id,
    b.name AS brand_name,
    b.code AS brand_code,
    se.id AS season_id,
    se.name AS season_name,
    COUNT(DISTINCT s.id) AS total_skus,
    SUM(s.total_quantity) AS total_units,
    SUM(s.total_cost) AS total_cost,
    SUM(s.total_retail) AS total_retail_value,
    AVG(CASE WHEN s.retail_price > 0 
        THEN (s.retail_price - s.unit_cost) / s.retail_price * 100 
        ELSE 0 END) AS avg_margin_percent,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) AS approved_skus,
    COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) AS pending_skus,
    COUNT(DISTINCT CASE WHEN s.status = 'rejected' THEN s.id END) AS rejected_skus
FROM sku_items s
LEFT JOIN brands b ON s.brand_id = b.id
LEFT JOIN seasons se ON s.season_id = se.id
WHERE s.deleted_at IS NULL
GROUP BY b.id, b.name, b.code, se.id, se.name;

-- Sales Summary by Month
CREATE OR REPLACE VIEW reporting.agg_sales_monthly AS
SELECT 
    DATE_TRUNC('month', hs.period_start) AS month,
    TO_CHAR(hs.period_start, 'YYYY-MM') AS year_month,
    b.id AS brand_id,
    b.name AS brand_name,
    c.id AS category_id,
    c.name AS category_name,
    l.id AS location_id,
    l.name AS location_name,
    SUM(hs.units_sold) AS total_units_sold,
    SUM(hs.units_ordered) AS total_units_ordered,
    SUM(hs.revenue) AS total_revenue,
    SUM(hs.cost) AS total_cost,
    SUM(hs.gross_margin) AS total_margin,
    AVG(hs.sell_through_percent) AS avg_sell_through,
    AVG(hs.stockout_rate) AS avg_stockout_rate,
    COUNT(DISTINCT hs.sku_id) AS unique_skus_sold
FROM historical_sales hs
LEFT JOIN brands b ON hs.brand_id = b.id
LEFT JOIN categories c ON hs.category_id = c.id
LEFT JOIN locations l ON hs.location_id = l.id
WHERE hs.deleted_at IS NULL
GROUP BY 
    DATE_TRUNC('month', hs.period_start),
    TO_CHAR(hs.period_start, 'YYYY-MM'),
    b.id, b.name, c.id, c.name, l.id, l.name;

-- Budget Utilization Summary
CREATE OR REPLACE VIEW reporting.agg_budget_utilization AS
SELECT 
    b.id AS brand_id,
    b.name AS brand_name,
    se.id AS season_id,
    se.name AS season_name,
    ba.budget_type,
    SUM(ba.allocated_amount) AS total_allocated,
    SUM(ba.spent_amount) AS total_spent,
    SUM(ba.remaining_amount) AS total_remaining,
    CASE 
        WHEN SUM(ba.allocated_amount) > 0 
        THEN ROUND(SUM(ba.spent_amount) / SUM(ba.allocated_amount) * 100, 2)
        ELSE 0 
    END AS overall_utilization_percent,
    COUNT(DISTINCT ba.location_id) AS locations_count,
    COUNT(DISTINCT CASE WHEN ba.status = 'approved' THEN ba.id END) AS approved_count,
    COUNT(DISTINCT CASE WHEN ba.status = 'pending' THEN ba.id END) AS pending_count
FROM budget_allocations ba
LEFT JOIN brands b ON ba.brand_id = b.id
LEFT JOIN seasons se ON ba.season_id = se.id
WHERE ba.deleted_at IS NULL
GROUP BY b.id, b.name, se.id, se.name, ba.budget_type;

-- =====================================================
-- PART 5: MATERIALIZED VIEWS (Performance Optimized)
-- =====================================================

-- Monthly Sales Summary (Materialized)
DROP MATERIALIZED VIEW IF EXISTS reporting.mv_sales_monthly_summary;
CREATE MATERIALIZED VIEW reporting.mv_sales_monthly_summary AS
SELECT 
    DATE_TRUNC('month', hs.period_start) AS month,
    TO_CHAR(hs.period_start, 'YYYY-MM') AS year_month,
    EXTRACT(YEAR FROM hs.period_start) AS year,
    EXTRACT(MONTH FROM hs.period_start) AS month_num,
    b.code AS brand_code,
    b.name AS brand_name,
    c.name AS category_name,
    l.code AS location_code,
    l.name AS location_name,
    SUM(hs.units_sold) AS total_units_sold,
    SUM(hs.units_ordered) AS total_units_ordered,
    SUM(hs.revenue) AS total_revenue,
    SUM(hs.cost) AS total_cost,
    SUM(hs.gross_margin) AS total_margin,
    ROUND(AVG(CASE WHEN hs.units_ordered > 0 
        THEN hs.units_sold::DECIMAL / hs.units_ordered * 100 
        ELSE 0 END), 2) AS avg_sell_through,
    COUNT(DISTINCT hs.id) AS record_count,
    NOW() AS refreshed_at
FROM historical_sales hs
LEFT JOIN brands b ON hs.brand_id = b.id
LEFT JOIN categories c ON hs.category_id = c.id
LEFT JOIN locations l ON hs.location_id = l.id
WHERE hs.deleted_at IS NULL
GROUP BY 
    DATE_TRUNC('month', hs.period_start),
    TO_CHAR(hs.period_start, 'YYYY-MM'),
    EXTRACT(YEAR FROM hs.period_start),
    EXTRACT(MONTH FROM hs.period_start),
    b.code, b.name, c.name, l.code, l.name
WITH DATA;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_mv_sales_monthly 
ON reporting.mv_sales_monthly_summary (year_month, brand_code, category_name, location_code);

-- SKU Metrics Summary (Materialized)
DROP MATERIALIZED VIEW IF EXISTS reporting.mv_sku_metrics_summary;
CREATE MATERIALIZED VIEW reporting.mv_sku_metrics_summary AS
SELECT 
    b.id AS brand_id,
    b.code AS brand_code,
    b.name AS brand_name,
    c.id AS category_id,
    c.name AS category_name,
    se.id AS season_id,
    se.name AS season_name,
    COUNT(DISTINCT s.id) AS total_skus,
    SUM(s.total_quantity) AS total_units,
    SUM(s.total_cost) AS total_cost,
    SUM(s.total_retail) AS total_retail_value,
    ROUND(AVG(CASE WHEN s.retail_price > 0 
        THEN (s.retail_price - s.unit_cost) / s.retail_price * 100 
        ELSE 0 END), 2) AS avg_margin_percent,
    MIN(s.unit_cost) AS min_unit_cost,
    MAX(s.unit_cost) AS max_unit_cost,
    AVG(s.unit_cost) AS avg_unit_cost,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) AS approved_skus,
    COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) AS pending_skus,
    COUNT(DISTINCT CASE WHEN s.status = 'rejected' THEN s.id END) AS rejected_skus,
    NOW() AS refreshed_at
FROM sku_items s
LEFT JOIN brands b ON s.brand_id = b.id
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN seasons se ON s.season_id = se.id
WHERE s.deleted_at IS NULL
GROUP BY b.id, b.code, b.name, c.id, c.name, se.id, se.name
WITH DATA;

CREATE UNIQUE INDEX idx_mv_sku_metrics 
ON reporting.mv_sku_metrics_summary (brand_id, category_id, season_id);

-- =====================================================
-- PART 6: WRAPPER VIEWS FOR MATERIALIZED VIEWS
-- (Power BI cannot directly see materialized views)
-- =====================================================

CREATE OR REPLACE VIEW reporting.vw_sales_monthly_summary AS
SELECT * FROM reporting.mv_sales_monthly_summary;

CREATE OR REPLACE VIEW reporting.vw_sku_metrics_summary AS
SELECT * FROM reporting.mv_sku_metrics_summary;

-- =====================================================
-- PART 7: REFRESH FUNCTIONS
-- =====================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION reporting.refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.mv_sales_monthly_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.mv_sku_metrics_summary;
    
    RAISE NOTICE 'All materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to refresh sales summary only
CREATE OR REPLACE FUNCTION reporting.refresh_sales_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.mv_sales_monthly_summary;
    RAISE NOTICE 'Sales summary refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to refresh SKU metrics only
CREATE OR REPLACE FUNCTION reporting.refresh_sku_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.mv_sku_metrics_summary;
    RAISE NOTICE 'SKU metrics refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 8: SCHEDULED JOBS (requires pg_cron extension)
-- =====================================================

-- Uncomment if pg_cron is available:
-- -- Refresh all views daily at 2 AM
-- SELECT cron.schedule('refresh-all-mv', '0 2 * * *', 'SELECT reporting.refresh_all_materialized_views()');
-- 
-- -- Refresh sales summary every 4 hours
-- SELECT cron.schedule('refresh-sales', '0 */4 * * *', 'SELECT reporting.refresh_sales_summary()');

-- =====================================================
-- PART 9: VERIFICATION QUERIES
-- =====================================================

-- List all views in reporting schema
SELECT 
    schemaname,
    viewname,
    'VIEW' AS type
FROM pg_views 
WHERE schemaname = 'reporting'
UNION ALL
SELECT 
    schemaname,
    matviewname AS viewname,
    'MATERIALIZED VIEW' AS type
FROM pg_matviews 
WHERE schemaname = 'reporting'
ORDER BY type, viewname;

-- Check row counts
SELECT 
    'dim_brands' AS view_name, 
    COUNT(*) AS row_count 
FROM reporting.dim_brands
UNION ALL
SELECT 'dim_categories', COUNT(*) FROM reporting.dim_categories
UNION ALL
SELECT 'dim_locations', COUNT(*) FROM reporting.dim_locations
UNION ALL
SELECT 'dim_seasons', COUNT(*) FROM reporting.dim_seasons
UNION ALL
SELECT 'fact_sku_performance', COUNT(*) FROM reporting.fact_sku_performance
UNION ALL
SELECT 'fact_budget_allocation', COUNT(*) FROM reporting.fact_budget_allocation
UNION ALL
SELECT 'fact_historical_sales', COUNT(*) FROM reporting.fact_historical_sales;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
