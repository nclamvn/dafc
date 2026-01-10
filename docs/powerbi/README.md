# Power BI Resources for DAFC OTB Platform

This folder contains ready-to-use Power BI resources.

## Quick Start

### 1. Import Power Query Scripts

1. Open Power BI Desktop
2. **Home** → **Transform Data** → **New Source** → **Blank Query**
3. Right-click the query → **Advanced Editor**
4. Copy & paste content from `.pq` files
5. Click **Done**

### 2. Add DAX Measures

1. In Power BI Desktop, select your data model
2. **Modeling** → **New Measure**
3. Copy individual measures from `DAX_Measures.dax`
4. Paste and press Enter

## Files

| File | Description |
|------|-------------|
| `Query_SKU_Performance.pq` | Power Query for SKU data |
| `Query_Budget_Summary.pq` | Power Query for budget data |
| `Query_OTB_Analysis.pq` | Power Query for OTB plans |
| `DAX_Measures.dax` | Collection of DAX measures |

## Configuration

Each `.pq` file has a configuration section at the top:

```powerquery
// ============================================
// CONFIGURATION - Edit these values
// ============================================
BaseUrl = "https://dafc-otb-platform.onrender.com",

// Optional filters (set to null to skip)
BrandId = null,      // e.g., "clxxxxx"
SeasonId = null,     // e.g., "clyyyyy"
```

## Authentication

The API requires authentication. Options:

1. **Cookie-based**: Get cookie from browser after login
2. **Anonymous**: If API is configured for public access

To add authentication in Power BI:
1. When prompted, select **Web** → **Advanced**
2. Add HTTP header: `Cookie` with your session cookie value

## Measure Categories

### Budget Measures
- Total Budget, Seasonal Budget, Replenishment Budget
- Budget Utilization %, Approval Rate %

### SKU Measures
- SKU Count, Order Value, Average Margin %
- Validation Rate, High/Low Margin SKUs

### OTB Measures
- OTB Plan Count, Total OTB Value
- Variance from Historical/System

### Time Intelligence
- YTD, MTD, YoY comparisons
- Running totals

### KPI Status
- Visual indicators: Good/Warning/Critical

## Need Help?

See the main guide: `../POWERBI_CONNECTION_GUIDE.md`
