# Hướng dẫn Deploy: MongoDB Atlas + Render + Vercel

Code hiện tại **không cần sửa** — mọi config (CORS, API URL, Socket URL) đều đọc từ biến môi trường. Chỉ cần làm theo các bước dưới.

---

## Bước 1: MongoDB Atlas

1. Vào https://cloud.mongodb.com → **Create a new Cluster** → chọn **M0 Free**.
2. **Database Access** → Add New Database User → tạo user/password riêng cho app (không dùng chung password với tài khoản Atlas).
3. **Network Access** → Add IP Address → chọn **Allow Access from Anywhere** (`0.0.0.0/0`) — cần thiết vì Render dùng IP động.
4. **Connect** → Driver: Node.js → copy connection string, dạng:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Thêm tên database vào cuối: `equipment_management_intern`. Atlas **luôn chạy replica set** nên Mongoose transaction (dùng trong `transactionService.js`, `maintenanceService.js`) hoạt động bình thường, không cần `?replicaSet=rs0` như local.

   → Connection string cuối cùng:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/equipment_management_intern?retryWrites=true&w=majority
   ```

---

## Bước 2: Render (Backend)

1. Vào https://render.com → **New** → **Web Service** → connect GitHub repo `project-web-intern`.
2. Cấu hình:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. **Environment Variables** (tab Environment):
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` (Render tự inject `PORT`, nhưng giữ để tương thích code hiện tại) |
   | `MONGO_URI` | connection string Atlas ở Bước 1 |
   | `JWT_SECRET` | một chuỗi random dài (không dùng giá trị mẫu trong `.env.example`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | để trống tạm, điền sau khi có domain Vercel ở Bước 3 (có thể điền nhiều origin, phân tách bằng dấu phẩy) |
4. Deploy. Sau khi chạy, domain backend có dạng: `https://project-web-intern.onrender.com`.
5. (Khuyến nghị) Seed data demo — vào Render Shell (tab Shell) chạy:
   ```
   npm run seed
   ```
   → tạo sẵn 3 tài khoản demo: `admin@buildco.demo`, `manager@buildco.demo`, `staff@buildco.demo` (password `123456`).

**Lưu ý free tier Render:** service sẽ "sleep" sau ~15 phút không có request, lần truy cập đầu sau đó sẽ chậm (~30-50s cold start) — nên ghi chú điều này khi demo cho nhà tuyển dụng (hoặc mở link trước vài phút).

**Lưu ý ảnh upload:** lưu trên disk local của Render — sẽ mất khi service redeploy/restart. Chấp nhận được cho mục đích demo CV.

---

## Bước 3: Vercel (Frontend)

1. Vào https://vercel.com → **Add New** → **Project** → import repo `project-web-intern`.
2. Cấu hình:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (tự nhận diện)
   - **Build Command:** `npm run build` (mặc định)
   - **Output Directory:** `dist` (mặc định)
3. **Environment Variables:**
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://project-web-intern.onrender.com/api` (domain Render ở Bước 2) |
4. Deploy. Domain frontend có dạng: `https://project-web-intern.vercel.app`.
5. `vercel.json` đã có sẵn trong `client/` để rewrite SPA routes (React Router) — không cần sửa.

---

## Bước 4: Nối lại CORS

Quay lại Render → Environment → cập nhật `CLIENT_URL` = domain Vercel ở Bước 3 (ví dụ `https://project-web-intern.vercel.app`). Nếu có nhiều domain (preview + production), phân tách bằng dấu phẩy:
```
CLIENT_URL=https://project-web-intern.vercel.app,https://project-web-intern-git-master.vercel.app
```
Lưu lại → Render tự redeploy.

---

## Bước 5: Kiểm tra

- [ ] Mở frontend Vercel → đăng nhập bằng tài khoản demo → dashboard load được (gọi API qua Render thành công, không lỗi CORS).
- [ ] Mở 2 tab, đổi trạng thái thiết bị ở tab 1 → tab 2 tự cập nhật (xác nhận Socket.io hoạt động qua wss://).
- [ ] Health check: `https://<render-domain>/api/health` → trả `{ "status": "ok" }`.

---

## Checklist bảo mật trước khi share link public

- [ ] `JWT_SECRET` trên Render là chuỗi random thật, **không** phải giá trị mẫu trong `.env.example`.
- [ ] Atlas database user có password riêng, không trùng password cá nhân.
- [ ] Nếu đổi password tài khoản demo trước khi share, nhớ cập nhật lại README/CV.
- [ ] Repo GitHub: nếu muốn public để nhà tuyển dụng xem code, đổi visibility ở Settings → Danger Zone → Change visibility (hiện đang **private**).
