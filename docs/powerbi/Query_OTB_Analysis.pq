// DAFC OTB Platform - OTB Analysis Query
// Import this into Power BI: Home > Transform Data > New Source > Blank Query > Advanced Editor

let
    // ============================================
    // CONFIGURATION - Edit these values
    // ============================================
    BaseUrl = "https://dafc-otb-platform.onrender.com",

    // Optional filters (set to null to skip)
    BrandId = null,         // e.g., "clxxxxx"
    SeasonId = null,        // e.g., "clyyyyy"
    Status = null,          // e.g., "DRAFT", "SUBMITTED", "APPROVED"

    // Set to true to include detailed line items
    IncludeLineItems = false,

    // ============================================
    // DO NOT EDIT BELOW THIS LINE
    // ============================================

    Endpoint = "/api/v1/reports/otb-analysis",

    // Build query parameters
    QueryParams = List.Select({
        if BrandId <> null then "brandId=" & BrandId else null,
        if SeasonId <> null then "seasonId=" & SeasonId else null,
        if Status <> null then "status=" & Status else null,
        "includeLineItems=" & (if IncludeLineItems then "true" else "false")
    }, each _ <> null),

    QueryString = "?" & Text.Combine(QueryParams, "&"),

    FullUrl = BaseUrl & Endpoint & QueryString,

    // Fetch data from API
    Source = Json.Document(Web.Contents(FullUrl)),

    // Extract plans array
    Plans = Source[data][plans],

    // Handle empty response
    Result = if Plans = null or List.Count(Plans) = 0
        then #table(
            {"plan_id", "plan_name", "brand_name", "season_name",
             "total_otb_value", "status"},
            {}
        )
        else Table.FromRecords(Plans),

    // Set appropriate column types
    TypedTable = Table.TransformColumnTypes(Result, {
        {"plan_id", type text},
        {"plan_name", type text},
        {"version", Int64.Type},
        {"version_type", type text},
        {"budget_id", type text},
        {"brand_id", type text},
        {"brand_code", type text},
        {"brand_name", type text},
        {"season_id", type text},
        {"season_code", type text},
        {"season_name", type text},
        {"location_id", type text},
        {"location_name", type text},
        {"status", type text},
        {"total_otb_value", type number},
        {"total_sku_count", Int64.Type},
        {"total_historical_value", type number},
        {"total_system_proposed", type number},
        {"total_user_buy", type number},
        {"total_units", Int64.Type},
        {"line_items_count", Int64.Type},
        {"anomaly_count", Int64.Type},
        {"ai_confidence_score", type number},
        {"variance_from_historical", type number},
        {"variance_from_system", type number},
        {"created_by_name", type text},
        {"approved_by_name", type text},
        {"created_at", type datetime},
        {"submitted_at", type datetime},
        {"approved_at", type datetime}
    })
in
    TypedTable
