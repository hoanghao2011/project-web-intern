# Equipment Management System (bản phát triển cho CV Intern Web)

> **Lưu ý:** đây là bản fork độc lập của dự án gốc tại `D:\project` (dùng cho CV Chuyên viên QLVT & Thiết bị — [repo gốc](https://github.com/hoanghao2011/equipment-management-system), [demo gốc](https://client-ochre-phi-81.vercel.app)). Bản này chạy trên port riêng (backend `5001`, frontend `5174`, database local `equipment_management_intern`) để phát triển song song mà không ảnh hưởng bản gốc, hướng tới bổ sung các tính năng kỹ thuật sâu hơn (testing, service layer, CI/CD, real-time...) phù hợp CV apply vị trí Intern Web Developer.

Ứng dụng web quản lý vòng đời thiết bị/vật tư trong doanh nghiệp xây dựng: nhập kho, xuất kho/cấp phát theo công trình, bảo trì định kỳ, sửa chữa, thanh lý — kèm dashboard thống kê và mã QR tra cứu nhanh cho từng thiết bị.

Ứng dụng web quản lý vòng đời thiết bị/vật tư trong doanh nghiệp xây dựng: nhập kho, xuất kho/cấp phát theo công trình, bảo trì định kỳ, sửa chữa, thanh lý — kèm dashboard thống kê và mã QR tra cứu nhanh cho từng thiết bị.

Dự án được xây dựng để mô phỏng bài toán thực tế của một **chuyên viên quản lý vật tư & thiết bị** trong ngành xây dựng: theo dõi thiết bị được cấp phát cho công trình nào, thiết bị nào sắp/đã quá hạn bảo trì, tỷ lệ hỏng hóc theo từng nhóm thiết bị, và giá trị tồn kho theo từng công trình.

## Tính năng chính

- **Quản lý thiết bị**: CRUD đầy đủ, upload hình ảnh, sinh mã QR tự động cho từng thiết bị
- **Vòng đời thiết bị** (state machine): Trong kho → Đang hoạt động → Đang bảo trì → Hỏng hóc → Đã thanh lý, với validate các bước chuyển trạng thái hợp lệ
- **Nhập kho / Xuất kho / Cấp phát theo công trình**: ghi log đầy đủ, tự động cập nhật số lượng tồn
- **Quản lý bảo trì**: lịch sử bảo trì định kỳ/sửa chữa, cảnh báo thiết bị sắp/đã quá hạn
- **Quản lý công trình**: theo dõi thiết bị đang được cấp phát tại từng công trình, tổng giá trị tài sản
- **Dashboard thống kê**: tỷ lệ trạng thái thiết bị, tỷ lệ hỏng hóc theo danh mục, xu hướng nhập/xuất theo tháng, tuổi đời trung bình thiết bị
- **Phân quyền theo vai trò**: Admin / Quản lý / Nhân viên
- **Mã QR**: hiển thị và in tem QR cho từng thiết bị để tra cứu nhanh

## Công nghệ sử dụng

**Frontend:** React 19 + Vite, TailwindCSS 4, React Router, Recharts, react-qr-code, React Hook Form + Zod, Axios

**Backend:** Node.js/Express 5, MongoDB + Mongoose, JWT + bcrypt, Multer (upload file), express-validator

## Cấu trúc dự án

```
project/
├── server/               # Backend Express API
│   └── src/
│       ├── config/       # Kết nối DB, cấu hình multer
│       ├── models/       # Mongoose schemas
│       ├── controllers/  # Business logic
│       ├── routes/       # API routes
│       ├── middleware/   # Auth, validation, error handling
│       └── scripts/      # Seed dữ liệu mẫu
└── client/               # Frontend React (Vite)
    └── src/
        ├── api/          # Axios API modules
        ├── pages/        # Các trang chính
        ├── components/   # Component dùng chung
        └── context/      # Auth context
```

## Chạy dự án local

### Yêu cầu
- Node.js 18+
- MongoDB (local hoặc MongoDB Atlas)

### Backend

```bash
cd server
npm install
npm run seed             # tạo dữ liệu mẫu (thiết bị, công trình, lịch sử...)
npm run dev              # http://localhost:5001
```

### Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5174
```

### Tài khoản demo (sau khi chạy `npm run seed`)

| Vai trò  | Email                  | Mật khẩu |
|----------|-------------------------|----------|
| Admin    | admin@buildco.demo      | 123456   |
| Manager  | manager@buildco.demo    | 123456   |
| Staff    | staff@buildco.demo      | 123456   |

## Phân quyền theo vai trò

Hệ thống có 3 vai trò với phạm vi thao tác khác nhau, mô phỏng cơ cấu thực tế của một bộ phận quản lý vật tư & thiết bị:

| Tác vụ | Admin | Manager (Quản lý) | Staff (Nhân viên) |
|---|:---:|:---:|:---:|
| Xem danh sách/chi tiết thiết bị, dashboard thống kê | ✅ | ✅ | ✅ |
| Xem lịch sử nhập/xuất, lịch sử bảo trì | ✅ | ✅ | ✅ |
| Thêm / sửa thông tin thiết bị | ✅ | ✅ | ❌ |
| **Xóa** thiết bị | ✅ | ❌ | ❌ |
| Thêm / sửa / xóa danh mục thiết bị | ✅ | ✅ | ❌ |
| Thêm / sửa / xóa công trình | ✅ | ✅ | ❌ |
| Ghi nhận nhập kho / xuất kho / cấp phát công trình | ✅ | ✅ | ✅ |
| Chuyển trạng thái thiết bị (hoạt động, bảo trì, hỏng, thanh lý) | ✅ | ✅ | ✅ |
| Ghi nhận bảo trì / sửa chữa | ✅ | ✅ | ✅ |
| Quản lý tài khoản người dùng | ✅ | ❌ | ❌ |

**Vai trò trong thực tế:**
- **Admin**: quản trị hệ thống — có toàn quyền, bao gồm xóa dữ liệu và quản lý tài khoản. Phù hợp với trưởng bộ phận vật tư hoặc IT quản trị hệ thống.
- **Manager (Quản lý vật tư)**: điều phối chính — thiết lập danh mục, mở công trình mới, thêm/cập nhật thông tin thiết bị, duyệt các giao dịch nhập/xuất lớn. Không có quyền xóa để tránh mất dữ liệu ngoài ý muốn.
- **Staff (Nhân viên kho/công trình)**: vận hành hàng ngày — ghi nhận nhập/xuất kho, cấp phát thiết bị cho công trình, cập nhật trạng thái khi thiết bị hỏng/cần bảo trì, ghi nhận kết quả bảo trì. Không thể chỉnh sửa thông tin gốc của thiết bị hay danh mục/công trình để đảm bảo tính toàn vẹn dữ liệu.

## Mô hình dữ liệu

- **Equipment**: thiết bị — mã QR, danh mục, số lượng, trạng thái, công trình hiện tại, lịch bảo trì
- **Category**: danh mục thiết bị (máy móc xây dựng, thiết bị điện, phương tiện vận chuyển...)
- **Site**: công trình đang triển khai
- **TransactionLog**: lịch sử nhập/xuất/điều chuyển thiết bị
- **MaintenanceRecord**: lịch sử bảo trì định kỳ và sửa chữa
- **User**: tài khoản người dùng với phân quyền
