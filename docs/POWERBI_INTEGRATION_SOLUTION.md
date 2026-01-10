# DAFC OTB Platform - Power BI Integration Solution

## Tổng quan

Tài liệu này mô tả chi tiết giải pháp kết nối PostgreSQL database của DAFC OTB Platform với Power BI để xuất report và phân tích dữ liệu.

---

## 1. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DAFC OTB Platform                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────┐ │
│  │   Next.js   │───▶│  PostgreSQL  │◀───│  Report Views (Optimized)   │ │
│  │   App       │    │  Database    │    │  Materialized Views         │ │
│  └─────────────┘    └──────────────┘    └─────────────────────────────┘ │
│                            │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    DATA EXPORT LAYER                                 ││
│  ├─────────────────┬─────────────────┬─────────────────────────────────┤│
│  │  REST API       │  Direct DB      │  Scheduled Export               ││
│  │  (JSON/CSV/     │  Connection     │  (XLSX/CSV to Cloud             ││
│  │   Excel)        │  (Power BI)     │   Storage)                      ││
│  └─────────────────┴─────────────────┴─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         POWER BI OPTIONS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Option A: Direct PostgreSQL Connection (DirectQuery/Import)             │
│  Option B: REST API Data Source (OData/Web)                             │
│  Option C: Excel/CSV File Import (Scheduled Refresh)                     │
│  Option D: Power BI Dataflows + Gateway                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phương án kết nối Power BI

### 2.1 Option A: Direct PostgreSQL Connection (Recommended)

**Ưu điểm:**
- Realtime data access
- Native Power BI connector
- Hỗ trợ DirectQuery và Import mode
- Tối ưu cho báo cáo phức tạp

**Yêu cầu:**
- PostgreSQL database accessible từ Power BI (public IP hoặc VPN)
- Npgsql driver (bundled trong Power BI Desktop từ Dec 2019)
- Power BI Gateway cho scheduled refresh trên Power BI Service

**Connection String:**
```
Server=dpg-xxx.oregon-postgres.render.com;
Port=5432;
Database=dafc_otb_production;
User Id=dafc_user;
Password=xxxxx;
SSL Mode=Require;
```

### 2.2 Option B: REST API Data Source

**Ưu điểm:**
- Không cần expose database ra ngoài
- Kiểm soát data được access
- Dễ implement security layer

**Nhược điểm:**
- Cần develop API endpoints
- Performance phụ thuộc API
- Không hỗ trợ DirectQuery

### 2.3 Option C: Scheduled Excel/CSV Export

**Ưu điểm:**
- Đơn giản nhất để implement
- Không cần cấu hình phức tạp
- Hoạt động với mọi Power BI license

**Nhược điểm:**
- Không realtime
- Manual process hoặc cần scheduler

### 2.4 Option D: Power BI Dataflows + Gateway

**Ưu điểm:**
- Enterprise-grade solution
- Centralized data management
- Incremental refresh support

**Nhược điểm:**
- Yêu cầu Power BI Premium
- Setup phức tạp hơn

---

## 3. Database Views cho Power BI (Đề xuất)

### 3.1 Tạo Reporting Schema

```sql
-- Create dedicated schema for reporting
CREATE SCHEMA IF NOT EXISTS reporting;

-- Grant read-only access to Power BI user
CREATE USER powerbi_reader WITH PASSWORD 'secure_password';
GRANT USAGE ON SCHEMA reporting TO powerbi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA reporting TO powerbi_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA reporting GRANT SELECT ON TABLES TO powerbi_reader;
```

### 3.2 Core Report Views

```sql
-- =====================================================
-- VIEW 1: SKU Performance Summary
-- Purpose: SKU-level analysis for buying decisions
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_sku_performance AS
SELECT 
    s.id AS sku_id,
    s.sku_code,
    s.product_name,
    b.name AS brand_name,
    b.code AS brand_code,
    c.name AS category_name,
    sc.name AS subcategory_name,
    s.season_id,
    se.name AS season_name,
    s.unit_cost,
    s.retail_price,
    s.wholesale_price,
    ROUND((s.retail_price - s.unit_cost) / s.retail_price * 100, 2) AS margin_percent,
    s.total_quantity,
    s.total_cost,
    s.total_retail,
    s.status,
    sp.name AS proposal_name,
    sp.status AS proposal_status,
    s.created_at,
    s.updated_at
FROM sku_items s
LEFT JOIN brands b ON s.brand_id = b.id
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
LEFT JOIN seasons se ON s.season_id = se.id
LEFT JOIN sku_proposals sp ON s.proposal_id = sp.id
WHERE s.deleted_at IS NULL;

-- =====================================================
-- VIEW 2: Budget vs Actual Analysis
-- Purpose: Budget allocation tracking
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_budget_analysis AS
SELECT 
    ba.id AS allocation_id,
    b.name AS brand_name,
    b.code AS brand_code,
    l.name AS location_name,
    l.code AS location_code,
    se.name AS season_name,
    ba.budget_type,
    ba.allocated_amount,
    ba.spent_amount,
    ba.remaining_amount,
    ROUND(ba.spent_amount / NULLIF(ba.allocated_amount, 0) * 100, 2) AS utilization_percent,
    ba.status,
    ba.approved_at,
    ba.created_at
FROM budget_allocations ba
LEFT JOIN brands b ON ba.brand_id = b.id
LEFT JOIN locations l ON ba.location_id = l.id
LEFT JOIN seasons se ON ba.season_id = se.id
WHERE ba.deleted_at IS NULL;

-- =====================================================
-- VIEW 3: OTB Analysis Summary
-- Purpose: Open-to-Buy tracking and planning
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_otb_analysis AS
SELECT 
    o.id AS otb_id,
    b.name AS brand_name,
    c.name AS category_name,
    se.name AS season_name,
    o.hierarchy_level,
    o.parent_id,
    o.historical_percent,
    o.system_proposed_percent,
    o.user_buy_percent,
    o.variance_percent,
    o.total_units,
    o.total_value,
    o.ai_recommendation,
    o.status,
    o.created_at,
    o.updated_at
FROM otb_analysis o
LEFT JOIN brands b ON o.brand_id = b.id
LEFT JOIN categories c ON o.category_id = c.id
LEFT JOIN seasons se ON o.season_id = se.id
WHERE o.deleted_at IS NULL;

-- =====================================================
-- VIEW 4: Size Distribution Analysis
-- Purpose: Size mix optimization
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_size_distribution AS
SELECT 
    sd.id,
    s.sku_code,
    s.product_name,
    b.name AS brand_name,
    c.name AS category_name,
    sd.size_code,
    sd.quantity,
    sd.percentage,
    sd.historical_sell_through,
    CASE 
        WHEN sd.size_code IN ('XS', 'S', 'M', 'L', 'XL', 'XXL') THEN 'Apparel'
        WHEN sd.size_code ~ '^[0-9]+$' THEN 'Shoes'
        ELSE 'Other'
    END AS size_category,
    sd.created_at
FROM size_distributions sd
LEFT JOIN sku_items s ON sd.sku_id = s.id
LEFT JOIN brands b ON s.brand_id = b.id
LEFT JOIN categories c ON s.category_id = c.id
WHERE sd.deleted_at IS NULL;

-- =====================================================
-- VIEW 5: Historical Sales Analysis
-- Purpose: Trend analysis and forecasting
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_historical_sales AS
SELECT 
    hs.id,
    b.name AS brand_name,
    c.name AS category_name,
    sc.name AS subcategory_name,
    l.name AS location_name,
    se.name AS season_name,
    hs.period_start,
    hs.period_end,
    hs.units_sold,
    hs.units_ordered,
    ROUND(hs.units_sold::DECIMAL / NULLIF(hs.units_ordered, 0) * 100, 2) AS sell_through_percent,
    hs.revenue,
    hs.cost,
    hs.gross_margin,
    ROUND(hs.gross_margin / NULLIF(hs.revenue, 0) * 100, 2) AS margin_percent,
    hs.stockout_rate,
    hs.created_at
FROM historical_sales hs
LEFT JOIN brands b ON hs.brand_id = b.id
LEFT JOIN categories c ON hs.category_id = c.id
LEFT JOIN subcategories sc ON hs.subcategory_id = sc.id
LEFT JOIN locations l ON hs.location_id = l.id
LEFT JOIN seasons se ON hs.season_id = se.id
WHERE hs.deleted_at IS NULL;

-- =====================================================
-- VIEW 6: Workflow & Approval Status
-- Purpose: Process tracking dashboard
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_workflow_status AS
SELECT 
    wi.id AS instance_id,
    wi.workflow_type,
    wi.entity_type,
    wi.entity_id,
    wi.current_step,
    wi.status AS workflow_status,
    u_creator.name AS created_by_name,
    u_assignee.name AS current_assignee,
    wi.due_date,
    CASE 
        WHEN wi.due_date < NOW() AND wi.status = 'pending' THEN 'Overdue'
        WHEN wi.due_date < NOW() + INTERVAL '2 days' AND wi.status = 'pending' THEN 'Due Soon'
        ELSE 'On Track'
    END AS urgency_status,
    wi.created_at,
    wi.completed_at,
    EXTRACT(DAY FROM (COALESCE(wi.completed_at, NOW()) - wi.created_at)) AS days_in_workflow
FROM workflow_instances wi
LEFT JOIN users u_creator ON wi.created_by = u_creator.id
LEFT JOIN users u_assignee ON wi.assigned_to = u_assignee.id
WHERE wi.deleted_at IS NULL;

-- =====================================================
-- VIEW 7: User Activity Summary
-- Purpose: User engagement metrics
-- =====================================================
CREATE OR REPLACE VIEW reporting.vw_user_activity AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    r.name AS role_name,
    u.last_login_at,
    COUNT(DISTINCT al.id) AS total_actions,
    COUNT(DISTINCT CASE WHEN al.created_at > NOW() - INTERVAL '7 days' THEN al.id END) AS actions_last_7_days,
    COUNT(DISTINCT CASE WHEN al.created_at > NOW() - INTERVAL '30 days' THEN al.id END) AS actions_last_30_days,
    u.created_at AS user_created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN activity_logs al ON u.id = al.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email, r.name, u.last_login_at, u.created_at;
```

### 3.3 Materialized Views cho Performance

```sql
-- =====================================================
-- MATERIALIZED VIEW: Monthly Sales Summary
-- Refresh: Daily at 2 AM
-- =====================================================
CREATE MATERIALIZED VIEW reporting.mv_monthly_sales_summary AS
SELECT 
    DATE_TRUNC('month', hs.period_start) AS month,
    b.code AS brand_code,
    b.name AS brand_name,
    c.name AS category_name,
    l.code AS location_code,
    SUM(hs.units_sold) AS total_units_sold,
    SUM(hs.revenue) AS total_revenue,
    SUM(hs.gross_margin) AS total_margin,
    AVG(hs.sell_through_percent) AS avg_sell_through,
    COUNT(DISTINCT hs.id) AS record_count
FROM historical_sales hs
LEFT JOIN brands b ON hs.brand_id = b.id
LEFT JOIN categories c ON hs.category_id = c.id
LEFT JOIN locations l ON hs.location_id = l.id
WHERE hs.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', hs.period_start), b.code, b.name, c.name, l.code
WITH DATA;

CREATE UNIQUE INDEX idx_mv_monthly_sales 
ON reporting.mv_monthly_sales_summary (month, brand_code, category_name, location_code);

-- Refresh function
CREATE OR REPLACE FUNCTION reporting.refresh_monthly_sales()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.mv_monthly_sales_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MATERIALIZED VIEW: SKU Performance Metrics
-- Refresh: Every 4 hours
-- =====================================================
CREATE MATERIALIZED VIEW reporting.mv_sku_metrics AS
SELECT 
    s.brand_id,
    b.name AS brand_name,
    s.category_id,
    c.name AS category_name,
    s.season_id,
    se.name AS season_name,
    COUNT(DISTINCT s.id) AS total_skus,
    SUM(s.total_quantity) AS total_units,
    SUM(s.total_cost) AS total_cost,
    SUM(s.total_retail) AS total_retail_value,
    AVG((s.retail_price - s.unit_cost) / NULLIF(s.retail_price, 0) * 100) AS avg_margin_percent,
    COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) AS approved_skus,
    COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) AS pending_skus
FROM sku_items s
LEFT JOIN brands b ON s.brand_id = b.id
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN seasons se ON s.season_id = se.id
WHERE s.deleted_at IS NULL
GROUP BY s.brand_id, b.name, s.category_id, c.name, s.season_id, se.name
WITH DATA;

CREATE UNIQUE INDEX idx_mv_sku_metrics 
ON reporting.mv_sku_metrics (brand_id, category_id, season_id);
```

### 3.4 Wrapper Views cho Materialized Views

Power BI không hiển thị materialized views trong Navigator. Workaround:

```sql
-- Create wrapper views that Power BI can see
CREATE OR REPLACE VIEW reporting.vw_monthly_sales_summary AS
SELECT * FROM reporting.mv_monthly_sales_summary;

CREATE OR REPLACE VIEW reporting.vw_sku_metrics AS
SELECT * FROM reporting.mv_sku_metrics;
```

---

## 4. REST API Endpoints cho Power BI

### 4.1 API Structure

```
/api/v1/reports/
├── sku-performance          GET - SKU performance data
├── budget-analysis          GET - Budget vs actual
├── otb-summary              GET - OTB analysis
├── sales-history            GET - Historical sales
├── export/
│   ├── sku-performance.csv  GET - Export as CSV
│   ├── sku-performance.xlsx GET - Export as Excel
│   └── ...
└── odata/                   OData endpoint for Power BI
```

### 4.2 Implementation Example

```typescript
// app/api/v1/reports/sku-performance/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const brandId = searchParams.get('brandId');
  const seasonId = searchParams.get('seasonId');
  const format = searchParams.get('format') || 'json';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '1000');

  const where: any = { deletedAt: null };
  if (brandId) where.brandId = brandId;
  if (seasonId) where.seasonId = seasonId;

  const data = await prisma.skuItem.findMany({
    where,
    include: {
      brand: { select: { id: true, name: true, code: true } },
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
      season: { select: { id: true, name: true } },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.skuItem.count({ where });

  // Transform for Power BI compatibility
  const transformed = data.map(item => ({
    sku_id: item.id,
    sku_code: item.skuCode,
    product_name: item.productName,
    brand_name: item.brand?.name,
    brand_code: item.brand?.code,
    category_name: item.category?.name,
    subcategory_name: item.subcategory?.name,
    season_name: item.season?.name,
    unit_cost: item.unitCost,
    retail_price: item.retailPrice,
    margin_percent: item.retailPrice > 0 
      ? ((item.retailPrice - item.unitCost) / item.retailPrice * 100).toFixed(2)
      : 0,
    total_quantity: item.totalQuantity,
    total_cost: item.totalCost,
    total_retail: item.totalRetail,
    status: item.status,
    created_at: item.createdAt.toISOString(),
    updated_at: item.updatedAt.toISOString(),
  }));

  if (format === 'csv') {
    return generateCSV(transformed);
  }

  return NextResponse.json({
    data: transformed,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      filters: { brandId, seasonId },
    },
  });
}

function generateCSV(data: any[]) {
  if (data.length === 0) {
    return new NextResponse('', { status: 200, headers: { 'Content-Type': 'text/csv' } });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const val = row[h];
        // Escape commas and quotes
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',')
    ),
  ];

  return new NextResponse(csvRows.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sku_performance.csv"',
    },
  });
}
```

### 4.3 Excel Export Endpoint

```typescript
// app/api/v1/reports/export/sku-performance.xlsx/route.ts

import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // ... authentication & data fetching ...

  const data = await fetchSKUPerformanceData(request);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Main data sheet
  const worksheet = XLSX.utils.json_to_sheet(data.transformed);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SKU Performance');

  // Summary sheet
  const summary = calculateSummary(data.transformed);
  const summarySheet = XLSX.utils.json_to_sheet([summary]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Pivot-ready sheet
  const pivotSheet = XLSX.utils.json_to_sheet(data.transformed, {
    header: ['brand_name', 'category_name', 'season_name', 'total_retail', 'margin_percent'],
  });
  XLSX.utils.book_append_sheet(workbook, pivotSheet, 'Pivot Data');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sku_performance_${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  });
}
```

---

## 5. Power BI Configuration Guide

### 5.1 Direct PostgreSQL Connection

**Step 1: Open Power BI Desktop**
- File → Get Data → Database → PostgreSQL database

**Step 2: Connection Settings**
```
Server: dpg-xxx.oregon-postgres.render.com
Database: dafc_otb_production
Data Connectivity Mode: Import (recommended) or DirectQuery
```

**Step 3: Authentication**
```
Authentication Type: Database
Username: powerbi_reader
Password: [secure_password]
```

**Step 4: Select Tables/Views**
- Navigate to `reporting` schema
- Select: vw_sku_performance, vw_budget_analysis, vw_otb_analysis, etc.

### 5.2 Native Query Option

Cho truy cập Materialized Views:

```powerquery
let
    Source = PostgreSQL.Database("dpg-xxx.render.com", "dafc_otb_production", [Query="
        SELECT * FROM reporting.mv_monthly_sales_summary
        WHERE month >= '2024-01-01'
    "])
in
    Source
```

### 5.3 REST API Connection

```powerquery
let
    Source = Json.Document(Web.Contents(
        "https://dafc-otb-platform.onrender.com/api/v1/reports/sku-performance",
        [
            Headers = [
                #"Authorization" = "Bearer " & Token,
                #"Content-Type" = "application/json"
            ],
            Query = [
                pageSize = "10000",
                seasonId = "SS25"
            ]
        ]
    )),
    data = Source[data],
    #"Converted to Table" = Table.FromList(data, Splitter.SplitByNothing(), null, null, ExtraValues.Error)
in
    #"Converted to Table"
```

---

## 6. Scheduled Refresh Setup

### 6.1 Power BI Gateway Installation

1. Download Power BI On-premises Data Gateway
2. Install on server with network access to PostgreSQL
3. Sign in with Power BI account
4. Configure gateway settings

### 6.2 Configure Data Source

```
Gateway → Manage gateways → Add data source
- Data source name: DAFC_PostgreSQL
- Data source type: PostgreSQL
- Server: dpg-xxx.render.com:5432
- Database: dafc_otb_production
- Authentication: Basic
- Username/Password: [credentials]
- Privacy level: Organizational
```

### 6.3 Schedule Refresh

```
Dataset settings → Scheduled refresh
- Keep your data up to date: On
- Refresh frequency: Daily
- Time zone: (GMT+07:00) Bangkok, Hanoi, Jakarta
- Time: 06:00, 12:00, 18:00
```

---

## 7. Power BI Report Templates

### 7.1 Executive Dashboard

**Page 1: Overview**
- KPI Cards: Total Revenue, Total SKUs, Avg Margin
- Line Chart: Monthly Revenue Trend
- Donut Chart: Revenue by Brand
- Table: Top 10 SKUs by Revenue

**Page 2: Budget Analysis**
- Gauge Charts: Budget Utilization by Brand
- Waterfall Chart: Budget vs Actual
- Matrix: Budget allocation by Location x Category

**Page 3: OTB Analysis**
- Clustered Column: Historical vs Proposed vs Final Buy
- Scatter Plot: Variance Analysis
- Tree Map: Category Mix

### 7.2 DAX Measures

```dax
// Total Revenue
Total Revenue = SUM('vw_sku_performance'[total_retail])

// Average Margin
Avg Margin % = AVERAGE('vw_sku_performance'[margin_percent])

// YoY Growth
Revenue YoY Growth = 
VAR CurrentYear = SUM('vw_historical_sales'[revenue])
VAR PreviousYear = CALCULATE(
    SUM('vw_historical_sales'[revenue]),
    SAMEPERIODLASTYEAR('Calendar'[Date])
)
RETURN
DIVIDE(CurrentYear - PreviousYear, PreviousYear, 0)

// Budget Utilization
Budget Utilization % = 
DIVIDE(
    SUM('vw_budget_analysis'[spent_amount]),
    SUM('vw_budget_analysis'[allocated_amount]),
    0
)

// SKU Count by Status
Approved SKUs = 
CALCULATE(
    COUNTROWS('vw_sku_performance'),
    'vw_sku_performance'[status] = "approved"
)
```

---

## 8. Implementation Roadmap

### Phase 1: Database Preparation (Week 1)
- [ ] Create reporting schema
- [ ] Create PowerBI read-only user
- [ ] Implement core report views
- [ ] Create materialized views
- [ ] Setup refresh jobs

### Phase 2: API Development (Week 2)
- [ ] Implement report API endpoints
- [ ] Add CSV/Excel export
- [ ] Implement OData endpoint (optional)
- [ ] Add API authentication

### Phase 3: Power BI Setup (Week 3)
- [ ] Install Power BI Gateway
- [ ] Configure data sources
- [ ] Create data model
- [ ] Build report templates

### Phase 4: Testing & Optimization (Week 4)
- [ ] Performance testing
- [ ] Query optimization
- [ ] User acceptance testing
- [ ] Documentation

---

## 9. Security Considerations

### 9.1 Database Security
- Dedicated read-only user for Power BI
- IP whitelist for database access
- SSL/TLS encryption required
- Row-level security if needed

### 9.2 API Security
- API key or OAuth authentication
- Rate limiting
- Audit logging
- Data masking for sensitive fields

### 9.3 Power BI Security
- Row-level security in Power BI
- Workspace access control
- Sensitivity labels
- Certified datasets

---

## 10. Performance Best Practices

1. **Use Materialized Views** - Pre-aggregate data cho complex queries
2. **Implement Indexes** - Create appropriate indexes on reporting views
3. **Partition Large Tables** - Consider partitioning for historical data
4. **Use Import Mode** - Preferred over DirectQuery for complex models
5. **Incremental Refresh** - Enable for large datasets
6. **Optimize DAX** - Avoid complex row-by-row calculations
7. **Data Reduction** - Filter data at source, not in Power BI

---

## Appendix A: SQL Scripts

Full SQL scripts available in: `/scripts/powerbi/`
- `01_create_schema.sql`
- `02_create_views.sql`
- `03_create_materialized_views.sql`
- `04_create_refresh_jobs.sql`
- `05_create_user_permissions.sql`

## Appendix B: Power BI Template Files

Template files available in: `/powerbi/templates/`
- `DAFC_Executive_Dashboard.pbit`
- `DAFC_Budget_Analysis.pbit`
- `DAFC_SKU_Performance.pbit`
