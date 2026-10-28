# Equipment Management System

**Demo:** [project-web-intern.vercel.app](https://project-web-intern.vercel.app) · **API:** [project-web-intern.onrender.com/api/health](https://project-web-intern.onrender.com/api/health)

> Backend chạy trên Render free tier, có thể "ngủ" sau ~15 phút không hoạt động — lần truy cập đầu tiên có thể mất 30-50s để khởi động lại.

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

**Frontend:** React 19 + Vite, TailwindCSS 4, React Router, TanStack React Query, Socket.io-client, Recharts, react-qr-code, React Hook Form + Zod, Axios

**Backend:** Node.js/Express 5, MongoDB + Mongoose (transaction qua session), Socket.io, JWT + bcrypt, Multer (upload file), express-validator

**Testing:** Vitest + Supertest + mongodb-memory-server (backend), Vitest + React Testing Library (frontend component/hook), Playwright (E2E)

**DevOps:** GitHub Actions CI (lint + unit/integration + E2E), Docker + docker-compose (Mongo replica set, server, client qua nginx)

## Kiến trúc backend

Controller chỉ xử lý HTTP request/response; toàn bộ business logic nằm ở **service layer** (`server/src/services/`):

- `equipmentStateMachine.js` — nguồn chân lý duy nhất cho vòng đời trạng thái thiết bị (`STATUS_TRANSITIONS` trong `models/Equipment.js`). Trước đây logic này bị lặp lại không nhất quán ở 3 nơi khác nhau (đổi trạng thái thủ công, xuất kho tự động active, hoàn thành sửa chữa tự động active) — nay tất cả đều đi qua `assertValidTransition`/`applyStatusTransition`.
- `transactionService.js`, `maintenanceService.js` — bọc các thao tác ghi kép (cập nhật Equipment + tạo TransactionLog/MaintenanceRecord) trong Mongoose session/transaction để đảm bảo tính toàn vẹn dữ liệu khi có lỗi giữa chừng.
- Lỗi nghiệp vụ được throw dưới dạng `AppError` (không đụng `req`/`res`), xử lý tập trung ở `middleware/errorHandler.js`.

**Lưu ý:** vì dùng Mongoose transaction, MongoDB phải chạy dưới dạng **replica set** (kể cả single-node) — xem phần "Yêu cầu" bên dưới.

## Real-time

Backend dùng Socket.io, xác thực qua JWT ở bước handshake. Sau khi service layer commit thành công một thao tác ghi (đổi trạng thái, nhập/xuất kho, ghi nhận bảo trì), server phát sự kiện (`equipment:updated`, `transaction:created`, `maintenance:created`). Frontend lắng nghe các sự kiện này và gọi `queryClient.invalidateQueries` (React Query) để tự động làm mới dữ liệu trên mọi tab đang mở — không cần reload thủ công.

## Cấu trúc dự án

```
project/
├── server/               # Backend Express API
│   └── src/
│       ├── config/       # Kết nối DB, CORS, cấu hình multer
│       ├── models/       # Mongoose schemas
│       ├── services/     # Business logic (state machine, transaction, ...)
│       ├── controllers/  # HTTP request/response
│       ├── routes/       # API routes
│       ├── middleware/   # Auth, validation, error handling
│       ├── socket/       # Socket.io server + JWT handshake
│       ├── test/         # Test setup & helpers (mongodb-memory-server)
│       └── scripts/      # Seed dữ liệu mẫu
└── client/               # Frontend React (Vite)
    ├── e2e/              # Playwright E2E specs
    └── src/
        ├── api/          # Axios API modules
        ├── hooks/        # React Query hooks, socket cache invalidation
        ├── lib/          # queryClient, socket client
        ├── pages/        # Các trang chính
        ├── components/   # Component dùng chung
        └── context/      # Auth context
```

## Chạy dự án local

### Yêu cầu
- Node.js 18+
- MongoDB chạy dưới dạng **replica set** (kể cả single-node), vì backend dùng Mongoose transaction:
  ```bash
  # Nếu chạy mongod thủ công:
  mongod --replSet rs0
  # Sau đó init 1 lần duy nhất:
  mongosh --eval "rs.initiate()"
  ```
  Xem `server/.env.example` để biết định dạng URI (`?replicaSet=rs0`).

### Backend

```bash
cd server
npm install
npm run seed             # tạo dữ liệu mẫu (thiết bị, công trình, lịch sử...)
npm run dev              # http://localhost:5001
npm test                 # chạy test suite (Vitest + mongodb-memory-server, tự động dùng Mongo in-memory)
```

### Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5174
npm test                  # unit/component test (Vitest + React Testing Library)
npm run test:e2e          # E2E (Playwright) — cần backend đang chạy + đã seed dữ liệu
```

### Chạy bằng Docker Compose

```bash
docker compose up --build
```

Khởi động MongoDB (replica set 1 node, tự init), backend (`http://localhost:5001`) và frontend qua nginx (`http://localhost:8080`). Dữ liệu Mongo và thư mục `uploads` được lưu ở Docker volume, không mất khi container restart.

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
