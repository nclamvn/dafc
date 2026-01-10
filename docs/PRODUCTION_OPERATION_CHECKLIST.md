# 🎯 DAFC OTB Platform - PRODUCTION OPERATION CHECKLIST

## Góc nhìn: Khách hàng vận hành thực tế

**Nguyên tắc:** Không quan tâm kiến trúc, chỉ cần:
- ✅ Chạy được
- ✅ Chạy ngon
- ✅ Chạy bền bỉ
- ✅ Tin cậy trong môi trường thực tế

---

## 📋 CHECKLIST VẬN HÀNH HÀNG NGÀY

### 🌅 Buổi sáng (8:00 AM)

| # | Việc cần làm | Cách kiểm tra | ✓ |
|---|--------------|---------------|---|
| 1 | Mở app lên được không? | Vào https://dafc-otb-platform.onrender.com | ☐ |
| 2 | Đăng nhập được không? | Nhập email/password → vào Dashboard | ☐ |
| 3 | Dữ liệu hôm qua còn không? | Xem danh sách SKU, Budget đã tạo | ☐ |
| 4 | Có thông báo lỗi gì không? | Nhìn màn hình, không có màu đỏ | ☐ |

### 📊 Công việc chính

#### A. Quản lý Master Data

| Việc | Các bước | Kết quả mong đợi | ✓ |
|------|----------|------------------|---|
| Thêm Brand mới | Master Data → Brands → Add → Nhập tên → Save | Brand xuất hiện trong list | ☐ |
| Sửa Category | Categories → Click Edit → Sửa → Save | Thông tin cập nhật | ☐ |
| Xóa Location | Locations → Click Delete → Confirm | Item biến mất | ☐ |
| Tìm kiếm | Nhập từ khóa vào Search | Kết quả hiện ra nhanh | ☐ |

#### B. Lập ngân sách (Budget)

| Việc | Các bước | Kết quả mong đợi | ✓ |
|------|----------|------------------|---|
| Xem tổng quan | Budget → Nhìn Dashboard | Thấy số tổng, biểu đồ | ☐ |
| Xem biểu đồ | Click nút "Charts" | Biểu đồ hiển thị đẹp | ☐ |
| Tạo budget mới | Add Budget → Chọn Brand/Season → Nhập số | Budget được lưu | ☐ |
| So sánh brands | Xem Brand Comparison | Thấy so sánh rõ ràng | ☐ |
| Xuất báo cáo | Click Export | File Excel tải về máy | ☐ |

#### C. Phân tích OTB

| Việc | Các bước | Kết quả mong đợi | ✓ |
|------|----------|------------------|---|
| Mở OTB Calculator | OTB Analysis → Chọn plan → Calculator | Form hiện ra | ☐ |
| Nhập số liệu | Nhập Opening Stock, Sales, etc. | Số được accept | ☐ |
| Tính OTB | Click Calculate | Kết quả hiện ra đúng | ☐ |
| So sánh kịch bản | Tạo 2 scenarios → Compare | Thấy khác biệt | ☐ |
| Xuất kết quả | Click Export | File tải về | ☐ |

#### D. Import dữ liệu từ Excel

| Việc | Các bước | Kết quả mong đợi | ✓ |
|------|----------|------------------|---|
| Mở Import | SKU Proposal → Import Excel | Trang import mở ra | ☐ |
| Kéo thả file | Kéo file Excel vào vùng upload | File được nhận | ☐ |
| Xem preview | Sau upload | Thấy data trong bảng | ☐ |
| Sửa lỗi | Nếu có lỗi → sửa trực tiếp | Cell đổi màu | ☐ |
| Hoàn tất import | Click Import | Data vào hệ thống | ☐ |
| Kiểm tra | Về list SKU | Thấy data vừa import | ☐ |

---

## 🔴 KHI CÓ VẤN ĐỀ

### Bảng xử lý sự cố

| Triệu chứng | Nguyên nhân có thể | Cách xử lý |
|-------------|-------------------|------------|
| Trang trắng, loading mãi | Server đang ngủ (cold start) | Chờ 30 giây, refresh lại |
| Không đăng nhập được | Sai password hoặc session hết | Kiểm tra password, thử lại |
| Data không hiển thị | Chưa có data hoặc filter sai | Bỏ filter, kiểm tra có data không |
| Nút bấm không phản hồi | Đang xử lý hoặc bị lỗi | Chờ 5 giây, nếu không được thì refresh |
| Lỗi màu đỏ hiện ra | Lỗi hệ thống | Chụp màn hình, báo IT |
| Import Excel lỗi | File sai format | Kiểm tra file đúng mẫu không |
| Export không tải được | Browser block popup | Cho phép popup, thử lại |

### Liên hệ hỗ trợ

| Mức độ | Thời gian chờ | Liên hệ |
|--------|---------------|---------|
| Khẩn cấp (không vào được app) | 15 phút | Hotline IT |
| Quan trọng (feature lỗi) | 2 giờ | Email IT |
| Bình thường (câu hỏi sử dụng) | 24 giờ | Ticket system |

---

## 📈 CHỈ SỐ THEO DÕI

### Hàng ngày - User tự check

| Chỉ số | Mục tiêu | Cách đo |
|--------|----------|---------|
| App mở được | 100% | Thử mở 1 lần/ngày |
| Đăng nhập thành công | < 5 giây | Đếm thời gian |
| Trang load xong | < 3 giây | Cảm nhận |
| Không có lỗi đỏ | 0 lỗi | Quan sát màn hình |

### Hàng tuần - Báo cáo cho quản lý

| Chỉ số | Mục tiêu | Ghi chú |
|--------|----------|---------|
| Số lần app không vào được | 0 lần | |
| Số lần phải refresh vì lỗi | < 3 lần | |
| Số file import thành công | 100% | |
| Số báo cáo export được | 100% | |

---

## 🗓️ LỊCH BẢO TRÌ

| Thời gian | Hoạt động | Ảnh hưởng |
|-----------|-----------|-----------|
| Hàng đêm 2:00 AM | Backup database | Không ảnh hưởng |
| Chủ nhật 3:00 AM | Cập nhật hệ thống | App có thể chậm 5 phút |
| Cuối tháng | Dọn dẹp log | Không ảnh hưởng |

---

## 📝 GHI CHÚ VẬN HÀNH

### Những điều NÊN làm

✅ Đăng xuất khi rời máy  
✅ Backup file Excel trước khi import  
✅ Kiểm tra data sau khi import  
✅ Refresh trang nếu thấy lạ  
✅ Báo IT ngay khi có lỗi đỏ  

### Những điều KHÔNG NÊN làm

❌ Mở quá nhiều tab cùng lúc  
❌ Import file quá 10,000 dòng 1 lần  
❌ Chia sẻ password cho người khác  
❌ Bỏ qua thông báo lỗi  
❌ Tự ý sửa URL trên browser  

---

## 📞 THÔNG TIN QUAN TRỌNG

### URLs

| Môi trường | URL |
|------------|-----|
| Production | https://dafc-otb-platform.onrender.com |
| Health Check | https://dafc-otb-platform.onrender.com/api/v1/health |

### Tài khoản test

| Role | Email | Ghi chú |
|------|-------|---------|
| Admin | admin@dafc.com | Có mọi quyền |
| Finance | finance@dafc.com | Quản lý budget |
| Brand Manager | brand@dafc.com | Quản lý theo brand |

### File mẫu

| Loại | Tên file | Dùng cho |
|------|----------|----------|
| SKU Import | SKU_Import_Template.xlsx | Import SKU proposals |
| Budget Template | Budget_Template.xlsx | Nhập budget |

---

## ✅ SIGN-OFF HÀNG NGÀY

**Ngày:** _______________

| Hạng mục | OK | Ghi chú |
|----------|-----|---------|
| App hoạt động | ☐ | |
| Data đầy đủ | ☐ | |
| Không có lỗi | ☐ | |
| Backup đã chạy | ☐ | |

**Người kiểm tra:** _______________

---

*Document Version: 1.0*  
*Cập nhật: 2026-01-10*
