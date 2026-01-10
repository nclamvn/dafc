# DAFC OTB Platform

Hệ thống quản lý Open-To-Buy (OTB) và lập kế hoạch ngân sách cho ngành thời trang.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Đóng góp](#đóng-góp)

---

## Giới thiệu

**DAFC OTB Platform** là giải pháp toàn diện cho việc:
- Lập kế hoạch ngân sách theo mùa (Season Budget Planning)
- Phân tích Open-To-Buy (OTB Analysis)
- Quản lý đề xuất SKU (SKU Proposal Management)
- Quy trình phê duyệt đa cấp (Multi-level Approval Workflow)

### Dành cho ai?

| Vai trò | Chức năng chính |
|---------|-----------------|
| **Brand Manager** | Lập ngân sách, đề xuất SKU theo brand |
| **Finance Team** | Phê duyệt ngân sách, theo dõi chi tiêu |
| **Merchandiser** | Phân tích OTB, quản lý inventory |
| **Admin** | Quản lý master data, users, cấu hình hệ thống |

---

## Tính năng

### 1. Quản lý ngân sách (Budget Management)
- Tạo và quản lý ngân sách theo Season/Brand/Location
- Biểu đồ phân tích ngân sách (Charts & Analytics)
- So sánh ngân sách giữa các brand
- Theo dõi trạng thái phê duyệt

### 2. Phân tích OTB (Open-To-Buy Analysis)
- OTB Calculator với các kịch bản
- So sánh nhiều scenarios
- Xuất báo cáo Excel/PDF
- Tích hợp AI suggestions

### 3. Quản lý SKU Proposal
- Import SKU từ Excel (drag & drop)
- Column mapping tự động
- Preview và validate data trước khi import
- AI enrichment cho SKU data

### 4. Quy trình phê duyệt
- Workflow đa cấp (Draft → Submit → Review → Approve)
- Thông báo real-time
- Audit trail đầy đủ

### 5. Master Data
- Quản lý Brands, Categories, Locations
- Quản lý Users và phân quyền
- Import/Export data

### 6. Báo cáo & Analytics
- Dashboard tổng quan
- Biểu đồ xu hướng
- Export báo cáo

---

## Công nghệ sử dụng

### Frontend
| Công nghệ | Mục đích |
|-----------|----------|
| **Next.js 14** | React framework với App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS |
| **shadcn/ui** | UI components |
| **Recharts** | Biểu đồ và charts |
| **TanStack Table** | Data table với sorting, filtering |

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| **Next.js API Routes** | REST API endpoints |
| **Prisma** | ORM cho database |
| **PostgreSQL** | Database chính |
| **NextAuth.js** | Authentication |

### DevOps
| Công nghệ | Mục đích |
|-----------|----------|
| **Render** | Hosting (Web Service + PostgreSQL) |
| **GitHub Actions** | CI/CD |

---

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x hoặc yarn >= 1.22
- PostgreSQL >= 14 (hoặc dùng cloud database)

### Bước 1: Clone repository

```bash
git clone https://github.com/nclamvn/dafc.git
cd dafc
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình environment

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị:

```env
# Database - Thay bằng connection string thực
DATABASE_URL="postgresql://user:password@host:5432/database"

# Auth - Tạo secret key ngẫu nhiên
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (optional - cho AI features)
OPENAI_API_KEY="sk-..."
```

### Bước 4: Setup database

```bash
# Tạo tables từ schema
npx prisma db push

# Seed data mẫu (optional)
npx prisma db seed
```

---

## Cấu hình

### Environment Variables

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret key cho authentication |
| `NEXTAUTH_URL` | ✅ | URL của ứng dụng |
| `OPENAI_API_KEY` | ❌ | API key cho AI features |
| `REDIS_URL` | ❌ | Redis cho caching (optional) |
| `SMTP_HOST` | ❌ | Email server (optional) |

### Tạo NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Chạy ứng dụng

### Development mode

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### Production build

```bash
npm run build
npm start
```

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Mở [http://localhost:5555](http://localhost:5555)

---

## Cấu trúc dự án

```
dafc-otb-platform/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, forgot-password)
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── budget/          # Budget management
│   │   ├── otb-analysis/    # OTB calculator
│   │   ├── sku-proposal/    # SKU proposals
│   │   ├── master-data/     # Master data (brands, categories)
│   │   ├── approvals/       # Approval workflow
│   │   └── settings/        # System settings
│   └── api/                 # API routes
│       └── v1/              # API version 1
│
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── shared/              # Shared components
│   ├── forms/               # Form components
│   ├── budget/              # Budget-specific components
│   ├── otb/                 # OTB-specific components
│   └── excel/               # Excel import components
│
├── lib/                     # Utilities & helpers
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Auth configuration
│   ├── excel.ts            # Excel parsing
│   └── validations/        # Zod schemas
│
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
│
├── types/                   # TypeScript types
├── hooks/                   # Custom React hooks
├── docs/                    # Documentation
└── public/                  # Static files
```

---

## API Documentation

### Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://dafc-otb-platform.onrender.com/api/v1
```

### Endpoints chính

#### Health Check
```
GET /api/v1/health
```

#### Authentication
```
POST /api/auth/signin     # Đăng nhập
POST /api/auth/signout    # Đăng xuất
GET  /api/auth/session    # Lấy session hiện tại
```

#### Budgets
```
GET    /api/v1/budgets           # Danh sách budgets
POST   /api/v1/budgets           # Tạo budget mới
GET    /api/v1/budgets/:id       # Chi tiết budget
PUT    /api/v1/budgets/:id       # Cập nhật budget
DELETE /api/v1/budgets/:id       # Xóa budget
POST   /api/v1/budgets/:id/submit # Submit để phê duyệt
```

#### OTB Plans
```
GET    /api/v1/otb-plans         # Danh sách OTB plans
POST   /api/v1/otb-plans         # Tạo OTB plan
GET    /api/v1/otb-plans/:id     # Chi tiết OTB plan
POST   /api/v1/otb-plans/:id/calculate # Tính OTB
```

#### SKU Proposals
```
GET    /api/v1/sku-proposals           # Danh sách proposals
POST   /api/v1/sku-proposals           # Tạo proposal
GET    /api/v1/sku-proposals/:id       # Chi tiết proposal
POST   /api/v1/sku-proposals/:id/import # Import SKUs từ JSON
POST   /api/v1/sku-proposals/:id/upload # Upload Excel file
```

#### Master Data
```
GET/POST   /api/v1/brands        # Brands
GET/POST   /api/v1/categories    # Categories
GET/POST   /api/v1/locations     # Locations
GET/POST   /api/v1/seasons       # Seasons
```

---

## Deployment

### Deploy lên Render

1. **Tạo PostgreSQL database** trên Render
2. **Tạo Web Service** từ GitHub repo
3. **Cấu hình environment variables**
4. **Deploy**

Chi tiết: Xem file `docs/DEPLOYMENT.md`

### Environment variables trên Render

```
DATABASE_URL=<từ Render PostgreSQL>
NEXTAUTH_SECRET=<generate random>
NEXTAUTH_URL=https://your-app.onrender.com
```

---

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm start` | Chạy production server |
| `npm run lint` | Kiểm tra linting |
| `npm run type-check` | Kiểm tra TypeScript |
| `npx prisma db push` | Sync schema với database |
| `npx prisma studio` | Mở database GUI |
| `npx prisma generate` | Generate Prisma client |

---

## Tài khoản Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dafc.com | (liên hệ admin) |
| Finance | finance@dafc.com | (liên hệ admin) |
| Brand Manager | brand@dafc.com | (liên hệ admin) |

---

## Đóng góp

### Quy trình đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Commit changes (`git commit -m 'Add: tính năng mới'`)
4. Push branch (`git push origin feature/ten-tinh-nang`)
5. Tạo Pull Request

### Coding Standards

- Sử dụng TypeScript strict mode
- Follow ESLint rules
- Viết meaningful commit messages
- Thêm tests cho features mới (nếu có thể)

---

## Hỗ trợ

- **Issues**: [GitHub Issues](https://github.com/nclamvn/dafc/issues)
- **Email**: [support@dafc.com](mailto:support@dafc.com)

---

## License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## Changelog

### v1.0.0 (2025-01-10)
- Initial release
- Budget management với charts
- OTB Calculator
- SKU Proposal với Excel import
- Multi-level approval workflow
- Master data management

---

*Built with ❤️ by DAFC Team*
