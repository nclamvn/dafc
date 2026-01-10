// DAFC OTB Platform - SKU Performance Query
// Import this into Power BI: Home > Transform Data > New Source > Blank Query > Advanced Editor

let
    // ============================================
    // CONFIGURATION - Edit these values
    // ============================================
    BaseUrl = "https://dafc-otb-platform.onrender.com",

    // Optional filters (set to null to skip)
    BrandId = null,      // e.g., "clxxxxx"
    SeasonId = null,     // e.g., "clyyyyy"
    CategoryId = null,   // e.g., "clzzzzz"
    Status = null,       // e.g., "APPROVED", "PENDING", "VALIDATED"

    // Pagination
    PageSize = 5000,     // Max records per request

    // ============================================
    // DO NOT EDIT BELOW THIS LINE
    // ============================================

    Endpoint = "/api/v1/reports/sku-performance",

    // Build query parameters
    QueryParams = List.Select({
        if BrandId <> null then "brandId=" & BrandId else null,
        if SeasonId <> null then "seasonId=" & SeasonId else null,
        if CategoryId <> null then "categoryId=" & CategoryId else null,
        if Status <> null then "status=" & Status else null,
        "pageSize=" & Text.From(PageSize)
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
            {"sku_id", "sku_code", "style_name", "brand_name", "season_name",
             "category_name", "retail_price", "cost_price", "margin_percent",
             "order_quantity", "validation_status"},
            {}
        )
        else Table.FromRecords(Data),

    // Set appropriate column types
    TypedTable = Table.TransformColumnTypes(Result, {
        {"sku_id", type text},
        {"sku_code", type text},
        {"style_name", type text},
        {"brand_id", type text},
        {"brand_name", type text},
        {"season_id", type text},
        {"season_name", type text},
        {"category_id", type text},
        {"category_name", type text},
        {"subcategory_name", type text},
        {"color_name", type text},
        {"material", type text},
        {"gender", type text},
        {"retail_price", type number},
        {"cost_price", type number},
        {"margin_percent", type number},
        {"order_quantity", Int64.Type},
        {"order_value", type number},
        {"validation_status", type text},
        {"ai_demand_score", type number},
        {"is_new", type logical},
        {"is_active", type logical},
        {"created_at", type datetime}
    })
in
    TypedTable
