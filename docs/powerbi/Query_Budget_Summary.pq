// DAFC OTB Platform - Budget Summary Query
// Import this into Power BI: Home > Transform Data > New Source > Blank Query > Advanced Editor

let
    // ============================================
    // CONFIGURATION - Edit these values
    // ============================================
    BaseUrl = "https://dafc-otb-platform.onrender.com",

    // Optional filters (set to null to skip)
    BrandId = null,      // e.g., "clxxxxx"
    SeasonId = null,     // e.g., "clyyyyy"
    LocationId = null,   // e.g., "clzzzzz"
    Status = null,       // e.g., "DRAFT", "SUBMITTED", "APPROVED"

    // ============================================
    // DO NOT EDIT BELOW THIS LINE
    // ============================================

    Endpoint = "/api/v1/reports/budget-summary",

    // Build query parameters
    QueryParams = List.Select({
        if BrandId <> null then "brandId=" & BrandId else null,
        if SeasonId <> null then "seasonId=" & SeasonId else null,
        if LocationId <> null then "locationId=" & LocationId else null,
        if Status <> null then "status=" & Status else null
    }, each _ <> null),

    QueryString = if List.Count(QueryParams) > 0
        then "?" & Text.Combine(QueryParams, "&")
        else "",

    FullUrl = BaseUrl & Endpoint & QueryString,

    // Fetch data from API
    Source = Json.Document(Web.Contents(FullUrl)),

    // Extract data array
    Data = Source[data],

    // Handle empty response
    Result = if Data = null or List.Count(Data) = 0
        then #table(
            {"budget_id", "brand_name", "season_name", "location_name",
             "total_budget", "seasonal_budget", "replenishment_budget", "status"},
            {}
        )
        else Table.FromRecords(Data),

    // Set appropriate column types
    TypedTable = Table.TransformColumnTypes(Result, {
        {"budget_id", type text},
        {"version", Int64.Type},
        {"brand_id", type text},
        {"brand_code", type text},
        {"brand_name", type text},
        {"season_id", type text},
        {"season_code", type text},
        {"season_name", type text},
        {"location_id", type text},
        {"location_code", type text},
        {"location_name", type text},
        {"total_budget", type number},
        {"seasonal_budget", type number},
        {"replenishment_budget", type number},
        {"currency", type text},
        {"seasonal_percent", type number},
        {"replenishment_percent", type number},
        {"status", type text},
        {"otb_plans_count", Int64.Type},
        {"created_by_name", type text},
        {"approved_by_name", type text},
        {"created_at", type datetime},
        {"submitted_at", type datetime},
        {"approved_at", type datetime}
    })
in
    TypedTable
