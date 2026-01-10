# 🤖 DAFC AI COPILOT - CHIẾN LƯỢC 2026

## Tầm nhìn: AI Copilot dẫn đầu ngành Fashion Retail

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   TỪ: Tool thụ động - User hỏi, System trả lời                           ║
║   ĐẾN: Copilot chủ động - AI đề xuất, User quyết định                    ║
║                                                                           ║
║   "AI không thay thế người, AI NÂNG TẦM người"                           ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 MỤC TIÊU

### Định lượng

| Metric | Hiện tại | Mục tiêu 2026 |
|--------|----------|---------------|
| Thời gian lập budget | 2-3 ngày | < 2 giờ |
| Độ chính xác dự báo | ~60% | > 85% |
| Quyết định OTB | Manual 100% | AI-assisted 80% |
| Phát hiện anomaly | Reactive | Proactive real-time |

### Định tính

- ✅ Mọi user đều có "trợ lý riêng" hiểu context công việc
- ✅ AI đề xuất trước khi user nghĩ đến
- ✅ Giảm cognitive load, tăng strategic thinking
- ✅ Competitive advantage rõ rệt trong ngành

---

## 📦 AI FEATURES ROADMAP

### Phase 1: SMART CHAT (Tuần 1-2) 🟢 Priority

**Mục tiêu:** AI Chat hiểu context DAFC, trả lời câu hỏi nghiệp vụ

**Features:**
- [ ] Context-aware chat (hiểu user đang ở trang nào)
- [ ] Query database bằng ngôn ngữ tự nhiên
- [ ] Explain data và visualizations
- [ ] Multi-turn conversation với memory

**Tech Stack:**
- GPT-4o / Claude API
- LangChain for orchestration
- Vector store for context (Pinecone/Supabase)

---

### Phase 2: PROACTIVE INSIGHTS (Tuần 2-3) 🟡 Priority

**Mục tiêu:** AI tự động phát hiện insights, không cần user hỏi

**Features:**
- [ ] Anomaly detection (sales, inventory, budget)
- [ ] Trend identification
- [ ] Smart notifications (không spam, chỉ important)
- [ ] Daily/Weekly digest email

---

### Phase 3: DEMAND FORECASTING (Tuần 3-4) 🟡 Priority

**Mục tiêu:** Dự báo demand chính xác để optimize OTB

**Features:**
- [ ] SKU-level demand forecast
- [ ] Seasonal pattern recognition
- [ ] External factors integration (events, weather)
- [ ] Confidence intervals

---

### Phase 4: DECISION COPILOT (Tuần 4-6) 🔴 High Value

**Mục tiêu:** AI đề xuất quyết định, user chỉ cần approve

**Features:**
- [ ] OTB optimization recommendations
- [ ] Budget allocation suggestions
- [ ] What-if scenario analysis
- [ ] Risk assessment

---

### Phase 5: AUTONOMOUS ACTIONS (Future)

**Mục tiêu:** AI tự động thực hiện actions với approval rules

```
Low risk actions → Auto-execute → Notify user
Medium risk → Recommend → User approves
High risk → Recommend → Manager approves
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### API Endpoints

```typescript
// AI Chat
POST /api/ai/chat
{
  "message": "Budget của Gucci mùa SS25?",
  "context": {
    "currentPage": "/budget",
    "selectedBrand": "gucci",
    "selectedSeason": "SS25"
  }
}

// AI Insights
GET /api/ai/insights
GET /api/ai/insights/anomalies
GET /api/ai/insights/trends

// AI Recommendations
GET /api/ai/recommendations/otb
GET /api/ai/recommendations/budget
POST /api/ai/recommendations/apply

// AI Forecast
GET /api/ai/forecast/demand?sku=xxx
GET /api/ai/forecast/sales?brand=xxx&season=xxx
```

### Database Schema Additions

```prisma
model AIConversation {
  id        String   @id @default(cuid())
  userId    String
  messages  Json     // Array of messages
  context   Json     // Page context, filters, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
}

model AIInsight {
  id          String   @id @default(cuid())
  type        String   // anomaly, trend, opportunity
  severity    String   // high, medium, low
  title       String
  description String
  data        Json
  isRead      Boolean  @default(false)
  isDismissed Boolean  @default(false)
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
}

model AIRecommendation {
  id          String   @id @default(cuid())
  type        String   // otb, budget, pricing
  title       String
  description String
  impact      Json     // Expected revenue, margin, etc.
  actions     Json     // Specific actions to take
  status      String   // pending, applied, dismissed
  appliedAt   DateTime?
  appliedBy   String?
  createdAt   DateTime @default(now())
}
```

---

## 💰 RESOURCE REQUIREMENTS

### API Costs (Estimated Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI GPT-4o | ~100K tokens/day | $300-500 |
| Vector Store | 10GB | $50-100 |
| Background Jobs | 24/7 | $50 |
| **Total** | | **~$500/month** |

---

## 📊 SUCCESS METRICS

### User Adoption

| Metric | Target Week 4 | Target Month 3 |
|--------|---------------|----------------|
| Daily active AI users | 50% | 80% |
| Avg. AI queries/user/day | 3 | 10 |
| Recommendation acceptance rate | 30% | 60% |

### Business Impact

| Metric | Baseline | Target |
|--------|----------|--------|
| Time to complete OTB | 2 days | 4 hours |
| Forecast accuracy | 60% | 85% |
| Inventory turns | 4.0 | 5.0 |
| Stockout incidents | 15/month | <5/month |

---

*Document Version: 1.0*
*Created: 2025-01-10*
