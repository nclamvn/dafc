# 📊 DAFC OTB Platform - Power BI Resources Package

## 🎯 Dành cho đội Power BI

Package này chứa tất cả resources cần thiết để kết nối Power BI với DAFC OTB Platform.

---

## 📦 Nội dung Package

```
powerbi_resources/
│
├── 📄 01_reporting_views_v2.sql    # SQL script tạo reporting views
│
├── 📁 connections/
│   ├── DAFC_PostgreSQL.pbids       # Quick connect file cho PostgreSQL
│   └── DAFC_REST_API.pbids         # Quick connect file cho REST API
│
├── 📁 themes/
│   ├── DAFC_Corporate.json         # Theme chuẩn công ty
│   └── DAFC_Executive.json         # Theme cho Executive Dashboard
│
├── 📁 queries/
│   └── PowerQuery_Master_Template.pq   # 15+ Power Query scripts
│
├── 📁 measures/
│   └── DAX_Measures_Complete.dax   # 60+ DAX measures sẵn dùng
│
├── 📄 POWERBI_SETUP_GUIDE.md       # Hướng dẫn chi tiết (Tiếng Việt)
└── 📄 POWERBI_ANALYSIS.md          # Phân tích kỹ thuật
```

---

## 🚀 Quick Start

### Bước 1: Deploy SQL Views (DBA thực hiện)

```bash
psql $DATABASE_URL -f 01_reporting_views_v2.sql
```

**Views được tạo:**
| Schema | View | Mô tả |
|--------|------|-------|
| reporting | dim_brands | Dimension - Brands |
| reporting | dim_categories | Dimension - Categories |
| reporting | dim_locations | Dimension - Locations |
| reporting | dim_seasons | Dimension - Seasons |
| reporting | dim_users | Dimension - Users (no password) |
| reporting | dim_date | Dimension - Calendar |
| reporting | fact_budget_allocations | Fact - Budget data |
| reporting | agg_budget_by_brand_season | Aggregated summary |

### Bước 2: Kết nối Power BI

**Option A: PBIDS file (nhanh nhất)**
1. Mở `connections/DAFC_PostgreSQL.pbids` bằng Notepad
2. Thay `dpg-xxx` bằng server thực
3. Double-click để mở trong Power BI
4. Nhập credentials

**Option B: Manual connection**
```
Server:   [từ Render Dashboard]
Database: dafc_otb_production
Schema:   reporting
User:     powerbi_reader
```

### Bước 3: Apply Theme

1. Power BI → View → Themes → Browse
2. Chọn `themes/DAFC_Corporate.json`

### Bước 4: Import Measures

1. Mở `measures/DAX_Measures_Complete.dax`
2. Copy từng measure
3. Modeling → New Measure → Paste

---

## 📊 Database Schema

```
┌─────────────────┐         ┌─────────────────────┐
│   dim_brands    │────1:*──│                     │
├─────────────────┤         │                     │
│   dim_seasons   │────1:*──│  fact_budget_       │
├─────────────────┤         │  allocations        │
│   dim_locations │────1:*──│                     │
├─────────────────┤         │                     │
│   dim_users     │────1:*──│                     │
└─────────────────┘         └─────────────────────┘
                                    │
┌─────────────────┐                 │
│   dim_date      │────1:*──────────┘
└─────────────────┘
```

---

## 🎨 Theme Colors

### DAFC Corporate
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Navy | #1E3A5F | Headers, titles |
| Accent Gold | #D4AF37 | Highlights, KPIs |
| Success | #22C55E | Positive values |
| Warning | #F59E0B | Attention items |
| Error | #EF4444 | Negative values |

---

## 📈 Key Measures (Preview)

```dax
// Revenue
Total Budget = SUM(fact_budget_allocations[total_budget])

// Utilization
Budget Utilization % = DIVIDE([Allocated Budget], [Total Budget], 0)

// YoY Growth
YoY Growth = 
VAR CY = [Total Budget]
VAR PY = CALCULATE([Total Budget], SAMEPERIODLASTYEAR(dim_date[full_date]))
RETURN DIVIDE(CY - PY, PY, 0)

// KPI Color
Status Color = 
SWITCH(TRUE(),
    [Budget Utilization %] >= 0.9, "#22C55E",
    [Budget Utilization %] >= 0.7, "#F59E0B",
    "#EF4444"
)
```

---

## 🔗 API Endpoints (Alternative)

Nếu không thể kết nối trực tiếp DB:

| Endpoint | Method | Format |
|----------|--------|--------|
| `/api/export/sku-performance` | GET | JSON/CSV |
| `/api/export/budget-summary` | GET | JSON/CSV |
| `/api/export/otb-analysis` | GET | JSON/CSV |

**Parameters:**
- `format`: json, csv, odata
- `page`: 1, 2, 3...
- `pageSize`: 100-10000

---

## 📞 Support

| Type | Contact |
|------|---------|
| Technical Issues | Đội Dev DAFC |
| Power BI Questions | Đội BI DAFC |
| Data Questions | Data Team |

---

## ✅ Checklist

- [ ] SQL views deployed
- [ ] Power BI connected
- [ ] Theme applied
- [ ] Measures imported
- [ ] Relationships created
- [ ] Report designed
- [ ] Published to Service
- [ ] Scheduled refresh configured

---

**Version:** 1.0  
**Date:** 2026-01-10
