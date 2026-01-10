// =====================================================
// DAFC OTB Platform - Power Query Master Template
// =====================================================
// 
// This file contains all Power Query (M) scripts needed
// to connect Power BI to DAFC data sources
//
// HOW TO USE:
// 1. Open Power BI Desktop
// 2. Home → Transform Data → New Source → Blank Query
// 3. Advanced Editor → Paste the query you need
// 4. Update parameters (server, database, API URL)
// 5. Click Done → Close & Apply
//
// =====================================================


// =====================================================
// SECTION 1: PARAMETERS (Set these first!)
// =====================================================

// Create these as Parameters in Power BI:
// 1. Query → Manage Parameters → New Parameter

/*
Parameter: ServerName
Type: Text
Current Value: dpg-xxx.oregon-postgres.render.com

Parameter: DatabaseName
Type: Text
Current Value: dafc_otb_production

Parameter: APIBaseURL
Type: Text
Current Value: https://dafc-otb-platform.onrender.com

Parameter: Username
Type: Text
Current Value: powerbi_reader

Parameter: Password
Type: Text
Current Value: (your password)
*/


// =====================================================
// SECTION 2: DATABASE CONNECTION QUERIES
// =====================================================

// ----- 2.1: Brands (Dimension) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_dim_brands = Source{[Schema="reporting",Item="dim_brands"]}[Data]
in
    reporting_dim_brands

// ----- 2.2: Categories (Dimension) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_dim_categories = Source{[Schema="reporting",Item="dim_categories"]}[Data]
in
    reporting_dim_categories

// ----- 2.3: Locations (Dimension) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_dim_locations = Source{[Schema="reporting",Item="dim_locations"]}[Data]
in
    reporting_dim_locations

// ----- 2.4: Seasons (Dimension) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_dim_seasons = Source{[Schema="reporting",Item="dim_seasons"]}[Data]
in
    reporting_dim_seasons

// ----- 2.5: Users (Dimension) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_dim_users = Source{[Schema="reporting",Item="dim_users"]}[Data]
in
    reporting_dim_users

// ----- 2.6: Date (Dimension) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_dim_date = Source{[Schema="reporting",Item="dim_date"]}[Data]
in
    reporting_dim_date

// ----- 2.7: Budget Allocations (Fact) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_fact_budget = Source{[Schema="reporting",Item="fact_budget_allocations"]}[Data]
in
    reporting_fact_budget

// ----- 2.8: Audit Logs (Fact) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_fact_audit = Source{[Schema="reporting",Item="fact_audit_logs"]}[Data]
in
    reporting_fact_audit

// ----- 2.9: Budget by Brand & Season (Aggregated) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName, [CreateNavigationProperties=true]),
    reporting_agg = Source{[Schema="reporting",Item="agg_budget_by_brand_season"]}[Data]
in
    reporting_agg


// =====================================================
// SECTION 3: REST API CONNECTION QUERIES
// =====================================================

// ----- 3.1: SKU Performance (via API) -----
let
    // API call with pagination support
    GetPage = (page as number) =>
        let
            Source = Json.Document(
                Web.Contents(
                    APIBaseURL,
                    [
                        RelativePath = "/api/export/sku-performance",
                        Query = [
                            page = Text.From(page),
                            pageSize = "1000",
                            format = "json"
                        ],
                        Headers = [
                            #"Accept" = "application/json"
                        ]
                    ]
                )
            ),
            Data = Source[data]
        in
            Data,
    
    // Get first page to determine total pages
    FirstPage = Json.Document(
        Web.Contents(
            APIBaseURL,
            [
                RelativePath = "/api/export/sku-performance",
                Query = [page = "1", pageSize = "1000", format = "json"]
            ]
        )
    ),
    TotalPages = FirstPage[meta][totalPages],
    
    // Generate list of all pages
    PageNumbers = {1..TotalPages},
    AllData = List.Transform(PageNumbers, each GetPage(_)),
    CombinedData = List.Combine(AllData),
    
    // Convert to table
    AsTable = Table.FromList(CombinedData, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedRecords = Table.ExpandRecordColumn(AsTable, "Column1", 
        {"sku_id", "sku_code", "sku_name", "brand_name", "category_name", 
         "season_name", "unit_cost", "retail_price", "margin_percent", 
         "quantity", "status", "created_at"})
in
    ExpandedRecords

// ----- 3.2: Budget Summary (via API) -----
let
    Source = Json.Document(
        Web.Contents(
            APIBaseURL,
            [
                RelativePath = "/api/export/budget-summary",
                Query = [format = "json"],
                Headers = [#"Accept" = "application/json"]
            ]
        )
    ),
    Data = Source[data],
    AsTable = Table.FromList(Data, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedRecords = Table.ExpandRecordColumn(AsTable, "Column1",
        {"brand_id", "brand_name", "season_name", "location_name",
         "total_budget", "allocated_budget", "remaining_budget",
         "utilization_percent", "status"})
in
    ExpandedRecords

// ----- 3.3: OTB Analysis (via API) -----
let
    Source = Json.Document(
        Web.Contents(
            APIBaseURL,
            [
                RelativePath = "/api/export/otb-analysis",
                Query = [format = "json"],
                Headers = [#"Accept" = "application/json"]
            ]
        )
    ),
    Data = Source[data],
    AsTable = Table.FromList(Data, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedRecords = Table.ExpandRecordColumn(AsTable, "Column1",
        {"plan_id", "brand_name", "season_name", "category_name",
         "opening_stock", "planned_receipts", "planned_sales",
         "closing_stock", "otb_value", "variance_percent"})
in
    ExpandedRecords


// =====================================================
// SECTION 4: NATIVE SQL QUERIES (Advanced)
// =====================================================

// ----- 4.1: Custom SQL with Parameters -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName),
    CustomQuery = Value.NativeQuery(Source, 
        "SELECT 
            b.name as brand_name,
            s.name as season_name,
            SUM(ba.""totalBudget"") as total_budget,
            COUNT(DISTINCT ba.id) as allocation_count
         FROM budget_allocations ba
         JOIN brands b ON ba.""brandId"" = b.id
         JOIN seasons s ON ba.""seasonId"" = s.id
         WHERE s.""isCurrent"" = true
         GROUP BY b.name, s.name
         ORDER BY total_budget DESC",
        null,
        [EnableFolding=true]
    )
in
    CustomQuery

// ----- 4.2: Materialized View Query (via wrapper) -----
let
    Source = PostgreSQL.Database(ServerName, DatabaseName),
    CustomQuery = Value.NativeQuery(Source, 
        "SELECT * FROM reporting.vw_sales_monthly_summary",
        null,
        [EnableFolding=true]
    )
in
    CustomQuery


// =====================================================
// SECTION 5: DATA TRANSFORMATION FUNCTIONS
// =====================================================

// ----- 5.1: Currency Formatter -----
let
    FormatCurrency = (amount as number, currency as text) =>
        if currency = "USD" then 
            "$" & Number.ToText(amount, "N0")
        else if currency = "VND" then
            Number.ToText(amount, "N0") & " ₫"
        else
            Number.ToText(amount, "N0") & " " & currency
in
    FormatCurrency

// ----- 5.2: Status Color Mapper -----
let
    GetStatusColor = (status as text) =>
        if status = "APPROVED" then "#22C55E"
        else if status = "PENDING" or status = "SUBMITTED" then "#F59E0B"
        else if status = "REJECTED" then "#EF4444"
        else if status = "DRAFT" then "#94A3B8"
        else "#64748B"
in
    GetStatusColor

// ----- 5.3: Calculate YoY Growth -----
let
    CalculateYoYGrowth = (currentValue as number, previousValue as number) =>
        if previousValue = 0 then null
        else (currentValue - previousValue) / previousValue * 100
in
    CalculateYoYGrowth


// =====================================================
// SECTION 6: INCREMENTAL REFRESH SETUP
// =====================================================

// For tables with date columns, enable incremental refresh:
// 1. Create parameters: RangeStart and RangeEnd (Date/Time)
// 2. Filter your date column:

/*
let
    Source = PostgreSQL.Database(ServerName, DatabaseName),
    reporting_fact = Source{[Schema="reporting",Item="fact_budget_allocations"]}[Data],
    
    // Filter for incremental refresh
    FilteredRows = Table.SelectRows(reporting_fact, each 
        [created_at] >= RangeStart and 
        [created_at] < RangeEnd
    )
in
    FilteredRows
*/


// =====================================================
// END OF POWER QUERY TEMPLATE
// =====================================================
