# Power BI Connection Guide - DAFC OTB Platform

## Quick Start

### Option 1: REST API (Recommended)

Power BI can connect directly to the DAFC API endpoints.

#### Step 1: Get Authentication Token

1. Login to DAFC Platform: https://dafc-otb-platform.onrender.com
2. Open browser DevTools (F12) → Network tab
3. Look for any API request → Copy the `Cookie` header value

#### Step 2: Connect Power BI

1. Power BI Desktop → **Get Data** → **Web**
2. Select **Advanced**
3. Enter URL: `https://dafc-otb-platform.onrender.com/api/v1/reports/sku-performance`
4. Add HTTP Header:
   - Name: `Cookie`
   - Value: (paste your cookie value)
5. Click **OK**

---

## Available API Endpoints

| Endpoint | Description | Use Case |
|----------|-------------|----------|
| `/api/v1/reports/sku-performance` | SKU data with pricing | Product analysis |
| `/api/v1/reports/budget-summary` | Budget allocations | Financial planning |
| `/api/v1/reports/otb-analysis` | OTB plans & line items | Buying analysis |
| `/api/v1/reports/export/master-data.xlsx` | All master data | Dimension tables |

### Query Parameters

All endpoints support these filters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| `brandId` | `?brandId=abc123` | Filter by brand |
| `seasonId` | `?seasonId=xyz789` | Filter by season |
| `status` | `?status=APPROVED` | Filter by status |
| `format` | `?format=csv` | Output format (json/csv) |
| `page` | `?page=1` | Pagination |
| `pageSize` | `?pageSize=1000` | Records per page |

---

## Power Query M Scripts

Copy these scripts into Power BI's Advanced Editor.

### 1. SKU Performance Query

```powerquery
let
    // Configuration
    BaseUrl = "https://dafc-otb-platform.onrender.com",
    Endpoint = "/api/v1/reports/sku-performance",

    // Optional filters (set to null to skip)
    BrandId = null,
    SeasonId = null,

    // Build URL with parameters
    QueryParams = List.Select({
        if BrandId <> null then "brandId=" & BrandId else null,
        if SeasonId <> null then "seasonId=" & SeasonId else null
    }, each _ <> null),

    QueryString = if List.Count(QueryParams) > 0
        then "?" & Text.Combine(QueryParams, "&")
        else "",

    FullUrl = BaseUrl & Endpoint & QueryString,

    // Fetch data
    Source = Json.Document(Web.Contents(FullUrl)),
    Data = Source[data],

    // Convert to table
    Table = Table.FromRecords(Data),

    // Set column types
    TypedTable = Table.TransformColumnTypes(Table, {
        {"retail_price", type number},
        {"cost_price", type number},
        {"margin_percent", type number},
        {"order_quantity", Int64.Type},
        {"order_value", type number},
        {"created_at", type datetime}
    })
in
    TypedTable
```

### 2. Budget Summary Query

```powerquery
let
    BaseUrl = "https://dafc-otb-platform.onrender.com",
    Endpoint = "/api/v1/reports/budget-summary",

    Source = Json.Document(Web.Contents(BaseUrl & Endpoint)),
    Data = Source[data],
    Table = Table.FromRecords(Data),

    TypedTable = Table.TransformColumnTypes(Table, {
        {"total_budget", type number},
        {"seasonal_budget", type number},
        {"replenishment_budget", type number},
        {"seasonal_percent", type number},
        {"replenishment_percent", type number},
        {"created_at", type datetime}
    })
in
    TypedTable
```

### 3. OTB Analysis Query

```powerquery
let
    BaseUrl = "https://dafc-otb-platform.onrender.com",
    Endpoint = "/api/v1/reports/otb-analysis",

    // Set to "true" to include line items
    IncludeLineItems = "false",

    FullUrl = BaseUrl & Endpoint & "?includeLineItems=" & IncludeLineItems,

    Source = Json.Document(Web.Contents(FullUrl)),
    Plans = Source[data][plans],
    Table = Table.FromRecords(Plans),

    TypedTable = Table.TransformColumnTypes(Table, {
        {"total_otb_value", type number},
        {"total_user_buy", type number},
        {"variance_from_historical", type number},
        {"variance_from_system", type number},
        {"created_at", type datetime}
    })
in
    TypedTable
```

### 4. Master Data (Brands)

```powerquery
let
    BaseUrl = "https://dafc-otb-platform.onrender.com",

    Source = Excel.Workbook(
        Web.Contents(BaseUrl & "/api/v1/reports/export/master-data.xlsx"),
        null, true
    ),

    BrandsSheet = Source{[Item="Brands", Kind="Sheet"]}[Data],
    PromotedHeaders = Table.PromoteHeaders(BrandsSheet, [PromoteAllScalars=true])
in
    PromotedHeaders
```

---

## Option 2: Direct Database Connection

For real-time data, connect directly to PostgreSQL.

### Prerequisites

1. Install Power BI Gateway (for scheduled refresh)
2. Get database credentials from Render Dashboard

### Connection Steps

1. Power BI Desktop → **Get Data** → **PostgreSQL database**
2. Enter server details:
   - Server: `dpg-xxxxx.render.com` (from Render)
   - Database: `dafc_otb`
3. Use Database credentials
4. Select tables or use custom SQL

### Recommended Views

After running `01_reporting_views_v2.sql`:

| View | Description |
|------|-------------|
| `reporting.dim_brands` | Brand dimension |
| `reporting.dim_categories` | Category dimension |
| `reporting.dim_seasons` | Season dimension |
| `reporting.dim_locations` | Location dimension |
| `reporting.fact_budget_allocations` | Budget fact table |
| `reporting.agg_budget_by_brand_season` | Pre-aggregated summary |

---

## DAX Measures

Add these measures to your Power BI model:

### Budget Analysis

```dax
// Total Budget
Total Budget = SUM('Budget'[total_budget])

// Budget Utilization %
Budget Utilization % =
DIVIDE(
    SUM('Budget'[seasonal_budget]) + SUM('Budget'[replenishment_budget]),
    SUM('Budget'[total_budget]),
    0
) * 100

// Budget by Brand
Budget by Brand =
CALCULATE(
    [Total Budget],
    ALLEXCEPT('Budget', 'Budget'[brand_name])
)
```

### SKU Analysis

```dax
// Average Margin
Average Margin % = AVERAGE('SKU'[margin_percent])

// Total Order Value
Total Order Value = SUM('SKU'[order_value])

// SKU Count by Status
SKU Count = COUNTROWS('SKU')

// High Margin SKUs (>50%)
High Margin SKUs =
CALCULATE(
    COUNTROWS('SKU'),
    'SKU'[margin_percent] > 50
)
```

### OTB Analysis

```dax
// Total OTB Value
Total OTB = SUM('OTB'[total_otb_value])

// Variance from Historical
Avg Variance % = AVERAGE('OTB'[variance_from_historical])

// Plans by Status
Plans Approved =
CALCULATE(
    COUNTROWS('OTB'),
    'OTB'[status] = "APPROVED"
)
```

---

## Scheduled Refresh

### For API Connection

1. Publish report to Power BI Service
2. Go to Dataset Settings → Data source credentials
3. Enter web credentials (Anonymous or Basic)
4. Set refresh schedule

### For Database Connection

1. Install On-premises data gateway
2. Configure gateway with PostgreSQL connection
3. Add database credentials in Power BI Service
4. Set refresh schedule

---

## Troubleshooting

### "401 Unauthorized" Error

- Cookie has expired → Login again and get new cookie
- Use API key instead (if available)

### "Connection Timeout"

- Render free tier may be sleeping
- Visit the website first to wake it up
- Wait 30-60 seconds and retry

### "No Data Returned"

- Check filter parameters
- Verify data exists for the selected filters
- Try without filters first

### Large Dataset Performance

- Use pagination: `?page=1&pageSize=1000`
- Apply filters to reduce data volume
- Consider using database connection for large datasets

---

## Sample Power BI Report Structure

### Recommended Pages

1. **Executive Dashboard**
   - Total Budget KPI
   - Budget by Brand (bar chart)
   - Approval Status (pie chart)

2. **SKU Analysis**
   - SKU count by category
   - Margin distribution
   - Top 10 SKUs by order value

3. **OTB Planning**
   - OTB by season
   - Variance analysis
   - Historical vs Planned comparison

4. **Trend Analysis**
   - Budget trend over time
   - SKU additions by month
   - Approval timeline

---

## Contact & Support

- Platform: https://dafc-otb-platform.onrender.com
- Documentation: See `/docs` folder in repository
- Issues: https://github.com/nclamvn/dafc/issues
