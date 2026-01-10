# 📊 HƯỚNG DẪN CÀI ĐẶT POWER BI CHO DAFC OTB PLATFORM

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Yêu cầu hệ thống](#2-yêu-cầu-hệ-thống)
3. [Kết nối Database](#3-kết-nối-database)
4. [Kết nối REST API](#4-kết-nối-rest-api)
5. [Áp dụng Theme](#5-áp-dụng-theme)
6. [Tạo Measures](#6-tạo-measures)
7. [Tạo Relationships](#7-tạo-relationships)
8. [Scheduled Refresh](#8-scheduled-refresh)
9. [Best Practices](#9-best-practices)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Tổng quan

### Package bao gồm:

```
powerbi_advanced/
├── connections/
│   ├── DAFC_PostgreSQL.pbids      # Kết nối trực tiếp DB
│   └── DAFC_REST_API.pbids        # Kết nối qua API
├── themes/
│   ├── DAFC_Corporate.json        # Theme công ty
│   └── DAFC_Executive.json        # Theme dashboard điều hành
├── queries/
│   └── PowerQuery_Master_Template.pq  # Tất cả Power Query scripts
├── measures/
│   └── DAX_Measures_Complete.dax  # 60+ DAX measures
└── POWERBI_SETUP_GUIDE.md         # File này
```

### Kiến trúc kết nối:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Power BI       │────▶│  Render         │────▶│  PostgreSQL     │
│  Desktop/Service│     │  Next.js API    │     │  Database       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                              ▲
         │              (Option 1: via API)             │
         │                                              │
         └──────────────────────────────────────────────┘
                     (Option 2: Direct DB)
```

---

## 2. Yêu cầu hệ thống

### Power BI Desktop
- Version: November 2024 trở lên (khuyến nghị)
- Download: https://powerbi.microsoft.com/desktop/

### Database Access
```
Server:   dpg-xxx.oregon-postgres.render.com
Port:     5432
Database: dafc_otb_production
User:     powerbi_reader
Password: [từ Render Dashboard]
Schema:   reporting
```

### API Access
```
Base URL: https://dafc-otb-platform.onrender.com
Endpoints:
  - /api/export/sku-performance
  - /api/export/budget-summary
  - /api/export/otb-analysis
```

---

## 3. Kết nối Database

### Cách 1: Dùng file PBIDS

1. Download file `DAFC_PostgreSQL.pbids`
2. Mở bằng Notepad, cập nhật server address
3. Double-click để mở trong Power BI
4. Nhập username/password khi được hỏi
5. Chọn tables từ schema `reporting`

### Cách 2: Kết nối thủ công

1. Power BI Desktop → **Get Data** → **PostgreSQL database**

2. Nhập thông tin:
   ```
   Server: dpg-xxx.oregon-postgres.render.com
   Database: dafc_otb_production
   ```

3. Chọn **Database** authentication
   ```
   Username: powerbi_reader
   Password: [your password]
   ```

4. Navigator → Expand **reporting** schema

5. Chọn các tables:
   - ☑️ dim_brands
   - ☑️ dim_categories
   - ☑️ dim_locations
   - ☑️ dim_seasons
   - ☑️ dim_users
   - ☑️ dim_date
   - ☑️ fact_budget_allocations
   - ☑️ agg_budget_by_brand_season

6. Click **Transform Data** để mở Power Query Editor

7. Kiểm tra data types và Click **Close & Apply**

### Cách 3: Native Query (cho Materialized Views)

Power BI Navigator không hiển thị Materialized Views. Dùng Native Query:

1. **Get Data** → **PostgreSQL**
2. Expand **Advanced options**
3. Trong **SQL statement**, nhập:
   ```sql
   SELECT * FROM reporting.vw_sales_monthly_summary
   ```
4. Click **OK**

---

## 4. Kết nối REST API

### Khi nào dùng API thay vì Database?

| Scenario | Khuyến nghị |
|----------|-------------|
| Real-time dashboard | Database (DirectQuery) |
| Scheduled refresh | API hoặc Database |
| Không có DB access | API |
| Custom data transformation | API |
| Cross-platform deployment | API |

### Kết nối API

1. **Get Data** → **Web**

2. Chọn **Advanced**

3. Cấu hình:
   ```
   URL parts:
   https://dafc-otb-platform.onrender.com/api/export/sku-performance
   
   HTTP request header parameters:
   Accept: application/json
   ```

4. Click **OK** → **Connect**

5. Chọn **Anonymous** (API không yêu cầu auth cho export)

6. Power Query Editor sẽ mở với JSON data

### Chuyển đổi JSON thành Table

Trong Power Query Editor:

1. Click **To Table** (nếu là list)
2. Expand column → Select all fields
3. Set đúng data types:
   - Số: Whole Number hoặc Decimal
   - Ngày: Date hoặc DateTime
   - Text: Text

---

## 5. Áp dụng Theme

### Cách áp dụng Theme

1. Power BI Desktop → **View** tab

2. Click **Themes** dropdown → **Browse for themes**

3. Chọn file theme:
   - `DAFC_Corporate.json` - Theme chuẩn công ty
   - `DAFC_Executive.json` - Theme cho leadership dashboard

4. Click **Open**

### Theme Preview

**DAFC Corporate Theme:**
- Primary: Navy (#1E3A5F)
- Accent: Gold (#D4AF37)
- Font: Plus Jakarta Sans / Inter
- Background: Light gray (#F8FAFC)

**DAFC Executive Theme:**
- Primary: Dark Navy (#0F172A)
- Emphasis on large numbers
- Elevated cards with shadows
- Clean, minimal design

### Customize Theme

Để chỉnh sửa theme:
1. Mở file .json bằng VS Code
2. Thay đổi màu trong `dataColors` array
3. Save và re-import

---

## 6. Tạo Measures

### Import tất cả Measures

1. Mở file `DAX_Measures_Complete.dax`

2. Với mỗi measure:
   - Copy measure definition
   - Power BI → **Modeling** → **New Measure**
   - Paste và Enter

### Measures quan trọng nhất

**Revenue & Sales:**
```dax
Total Revenue = 
SUMX(
    fact_budget_allocations,
    fact_budget_allocations[total_budget]
)
```

**Budget Analysis:**
```dax
Budget Utilization % = 
DIVIDE(
    [Allocated Budget],
    [Total Budget],
    0
)
```

**Time Intelligence:**
```dax
YoY Growth = 
VAR CurrentYear = [Total Revenue]
VAR PreviousYear = [Revenue PY]
RETURN
DIVIDE(
    CurrentYear - PreviousYear,
    PreviousYear,
    0
)
```

**KPI Colors:**
```dax
Budget Status Color = 
SWITCH(
    TRUE(),
    [Budget Utilization %] >= 0.9, "#22C55E",
    [Budget Utilization %] >= 0.7, "#F59E0B",
    "#EF4444"
)
```

---

## 7. Tạo Relationships

### Recommended Relationships

```
┌─────────────────┐         ┌─────────────────┐
│  dim_brands     │────1:*──│  fact_budget    │
│  (id)           │         │  (brand_id)     │
└─────────────────┘         └─────────────────┘
                                    │
┌─────────────────┐                 │
│  dim_seasons    │────1:*──────────┤
│  (id)           │                 │
└─────────────────┘                 │
                                    │
┌─────────────────┐                 │
│  dim_locations  │────1:*──────────┤
│  (id)           │                 │
└─────────────────┘                 │
                                    │
┌─────────────────┐                 │
│  dim_users      │────1:*──────────┘
│  (id)           │  (created_by_id)
└─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│  dim_date       │────1:*──│  fact_budget    │
│  (date_key)     │         │  (created_at)   │
└─────────────────┘         └─────────────────┘
```

### Tạo Relationship

1. **Modeling** → **Manage Relationships**
2. Click **New**
3. Chọn 2 tables và columns tương ứng
4. Chọn Cardinality: **Many to one (*:1)**
5. Cross filter direction: **Single**
6. Click **OK**

---

## 8. Scheduled Refresh

### Yêu cầu

- Power BI Pro hoặc Premium license
- Power BI Gateway (cho database connection)

### Setup Gateway

1. Download Power BI Gateway từ Microsoft
2. Cài đặt trên server có thể access database
3. Đăng nhập bằng tài khoản Power BI
4. Thêm data source:
   - Type: PostgreSQL
   - Server: dpg-xxx.oregon-postgres.render.com
   - Database: dafc_otb_production
   - Authentication: Basic
   - Username/Password: powerbi_reader / [password]

### Cấu hình Refresh

1. Publish report lên Power BI Service
2. Dataset Settings → Gateway connection
3. Chọn gateway đã setup
4. Scheduled refresh → Thêm lịch:
   - Frequency: Daily
   - Time zones: (GMT+7) Bangkok
   - Times: 06:00, 12:00, 18:00

---

## 9. Best Practices

### Performance

| Practice | Mô tả |
|----------|-------|
| Import vs DirectQuery | Dùng Import cho dashboard, DirectQuery cho real-time |
| Incremental Refresh | Bật cho tables lớn với date column |
| Aggregations | Dùng agg_* views cho reports tổng hợp |
| Filter early | Filter trong Power Query, không phải DAX |

### Data Modeling

| Practice | Mô tả |
|----------|-------|
| Star Schema | Fact tables ở giữa, Dim tables xung quanh |
| Date Table | Luôn dùng dim_date riêng biệt |
| Naming | snake_case cho columns (đồng bộ với SQL) |
| Hide columns | Ẩn foreign key columns khỏi report view |

### Report Design

| Practice | Mô tả |
|----------|-------|
| Max 8 visuals/page | Tránh quá tải thông tin |
| Consistent colors | Dùng theme colors |
| Mobile layout | Tạo mobile view cho mỗi page |
| Bookmarks | Dùng bookmarks cho navigation |

---

## 10. Troubleshooting

### Lỗi thường gặp

**"Unable to connect" khi kết nối PostgreSQL**
```
Nguyên nhân: Firewall hoặc IP không được whitelist
Giải pháp: 
1. Kiểm tra IP của bạn
2. Liên hệ admin để whitelist IP
3. Thử dùng VPN nếu cần
```

**"Query folding not possible"**
```
Nguyên nhân: Power Query không thể push filter xuống DB
Giải pháp:
1. Đơn giản hóa transformations
2. Dùng Native Query thay vì Navigator
```

**Refresh chậm**
```
Nguyên nhân: Quá nhiều data hoặc complex queries
Giải pháp:
1. Enable Incremental Refresh
2. Dùng aggregated views
3. Giảm số columns import
```

**Materialized Views không hiển thị**
```
Nguyên nhân: Power BI Navigator không support MVs
Giải pháp:
1. Dùng wrapper views (vw_*)
2. Hoặc dùng Native Query
```

### Liên hệ hỗ trợ

- Technical Support: tech@dafc.vn
- Power BI Admin: bi-admin@dafc.vn
- Documentation: https://docs.dafc.vn/powerbi

---

## Phụ lục: Quick Reference Card

### Connection Strings

```
# PostgreSQL
Server: dpg-xxx.oregon-postgres.render.com
Database: dafc_otb_production
Schema: reporting
User: powerbi_reader

# API Endpoints
GET /api/export/sku-performance
GET /api/export/budget-summary
GET /api/export/otb-analysis
```

### Cheat Sheet: DAX

```dax
// Sum
Total = SUM(table[column])

// Average
Avg = AVERAGE(table[column])

// Count
Count = COUNTROWS(table)

// Filter
Filtered = CALCULATE([Measure], table[col] = "value")

// Time Intelligence
YTD = TOTALYTD([Measure], date_table[date])
PY = CALCULATE([Measure], SAMEPERIODLASTYEAR(date_table[date]))

// Percentage
Pct = DIVIDE([Part], [Total], 0)

// Ranking
Rank = RANKX(ALL(table), [Measure], , DESC)
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-10  
**Author:** DAFC BI Team
