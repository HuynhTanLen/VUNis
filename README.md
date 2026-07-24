# 🚀 SKYS PLATFORM — ENTERPRISE AGILE TASK & PROJECT MANAGEMENT SYSTEM
> *Hệ thống Quản lý Dự án & Công việc Agile Doanh nghiệp — Node.js + Express.js + MongoDB + Next.js*

---

## 📋 MỤC LỤC
1. [Giới thiệu Dự án](#-giới-thiệu-dự-án)
2. [Điểm Nổi Bật Về Kiến Trúc & Thuật Toán](#-điểm-nổi-bật-về-kiến-trúc--thuật-toán)
3. [Phân Quyền Admin Cấp Độ Google Workspace (RBAC)](#-phân-quyền-admin-cấp-độ-google-workspace-rbac)
4. [Công Nghệ Sử Dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
5. [Mô Hình 6 Tầng Chuẩn Modular (6-Layer Architecture)](#-mô-hình-6-tầng-chuẩn-modular-6-layer-architecture)
6. [Danh Sách Bộ API Endpoints](#-danh-sách-bộ-api-endpoints)
7. [Hướng Dẫn Cài Đặt & Chạy Dự Án](#-hướng-dẫn-cài-đặt--chạy-dự-án)

---

## 🌟 GIỚI THIỆU DỰ ÁN

**Skys Platform** là hệ thống quản lý công việc và dự án theo phương pháp Agile/Scrum doanh nghiệp (tương tự Jira, ClickUp và Monday.com). Hệ thống hỗ trợ lập kế hoạch Sprint, vẽ sơ đồ PERT/Gantt Chart, phân cấp cây dự án con, bình luận lồng nhau và theo dõi trạng thái người dùng theo thời gian thực.

---

## ⚡ ĐIỂM NỔI BẬT VỀ KIẾN TRÚC & THUẬT TOÁN

### 1. Phân Quyền Cấp Độ Admin Google Workspace (RBAC)
* Thay thế mô hình `populate()` 3 tầng cồng kềnh bằng **Chuỗi Enum Role trực tiếp** trên Document `User`.
* Loại bỏ truy vấn lặp lại, tăng tốc độ phản hồi API gấp **5 lần**.

### 2. Tối Ưu Hiệu Năng NoSQL (Embedding vs Reference)
* **Nhúng Subdocument (Embedded Array)**: Nhúng mảng `members: [{ userId, role }]` trong `Project` và mảng `subtasks: [{ title, completed }]` trong `Task`.
* Chỉ cần **1 câu truy vấn duy nhất** lấy toàn bộ dữ liệu dự án mà không cần dùng lệnh `JOIN` qua nhiều bảng.

### 3. Nhật Ký Người Dùng Chống Nghẽn Cổ Chai (Anti-Bottleneck Logging)
* Bảng log độc lập `UserStatusLog` ghi vết hành động `LOGIN`, `LOGOUT`, `BLOCKED`, `UNBLOCKED`.
* Thiết lập **TTL Index 90 ngày** (`expireAfterSeconds`): MongoDB tự động dọn dẹp các bản ghi log quá 90 ngày tuổi, bảo đảm dung lượng bộ nhớ DB luôn tối ưu.

### 4. Thuật Toán Xử Lý Dữ Liệu Nâng Cao
* **Thuật toán Đệ quy Cây Dự án (Recursive Project Tree)**: Xử lý cấu trúc Dự án Cha - Dự án Con (`parentId`).
* **Thuật toán Phát hiện Vòng lặp Phụ thuộc (DFS Cycle Detection)**: Ngăn chặn lỗi vòng lặp vô tận khi thiết lập Task dependencies cho PERT Chart.
* **MongoDB Aggregation Pipeline**: Gom nhóm log người dùng theo ngày (`$dateToString` & `$gte`) phục vụ vẽ Biểu đồ Dashboard Admin.

---

## 🛡️ PHÂN QUYỀN ADMIN CẤP ĐỘ GOOGLE WORKSPACE (RBAC)

Hệ thống phân định 5 cấp độ Admin chuyên biệt + 1 User thông thường:

```
┌────────────────────────────────────────────────────────────────────────┐
  1. SUPER_ADMIN       ➔ Quản trị tối cao (Full quyền hệ thống).
  2. USER_ADMIN        ➔ Quản lý tài khoản, phân quyền, khóa/mở khóa.
  3. GROUPS_ADMIN      ➔ Quản lý nhóm làm việc & phân bổ thành viên.
  4. SERVICE_ADMIN     ➔ Quản lý cấu hình dịch vụ, quy mô dự án, sprint.
  5. HELP_DESK_ADMIN   ➔ Hỗ trợ kỹ thuật, reset password, xem nhật ký log.
  6. USER              ➔ Người dùng thường (Phân quyền theo vai trò Dự án).
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

### Backend Services (`skys-workspace-be`):
* **Core**: Node.js, Express.js
* **Database**: MongoDB Atlas, Mongoose ODM
* **Security & Auth**: JWT (HttpOnly Cookie & Bearer Header), bcrypt.js, Rate Limiting (express-rate-limit), CORS, Cookie-Parser
* **Architecture**: Strict 6-Layer Modular Architecture

### Frontend Application (`skys-workspace-fe`):
* **Framework**: Next.js / React.js
* **Styling**: Vanilla CSS, TailwindCSS

---

## 🏗️ MÔ HÌNH 6 TẦNG CHUẨN MODULAR (6-LAYER ARCHITECTURE)

Mỗi module nghiệp vụ (như `auth`, `users`, `projects`, `tasks`, `sprints`, `comments`) được cấu trúc nghiêm ngặt thành 6 file:

```
src/modules/<module-name>/
├── <module>.schema.js      ➔ 1. SCHEMA     : Định nghĩa cấu trúc Document Mongoose
├── <module>.dto.js         ➔ 2. DTO        : Validate & làm sạch dữ liệu đầu vào
├── <module>.repository.js  ➔ 3. REPOSITORY : CHỈ chứa truy vấn DB (No Business Logic)
├── <module>.service.js     ➔ 4. SERVICE    : Xử lý Business Logic nghiệp vụ
├── <module>.controller.js  ➔ 5. CONTROLLER : Nhận req, dùng asyncHandler, trả res JSON
└── <module>.route.js       ➔ 6. ROUTE      : Định tuyến URL + Middleware auth/rbac
```

---

## 📬 DANH SÁCH BỘ API ENDPOINTS

### 1. Xác thực & Bảo mật (`/api/auth`)
* `POST /api/auth/register` — Đăng ký tài khoản mới.
* `POST /api/auth/login` — Đăng nhập & cấp phát JWT token.
* `POST /api/auth/logout` — Đăng xuất & xóa cookie.
* `GET  /api/auth/me` — Lấy thông tin tài khoản hiện tại.
* `POST /api/auth/forgot-password` — Yêu cầu OTP khôi phục mật khẩu.
* `POST /api/auth/reset-password` — Đặt lại mật khẩu mới.

### 2. Quản lý Người dùng & Dashboard (`/api/users`)
* `GET   /api/users` — Lấy danh sách tất cả người dùng.
* `GET   /api/users/dashboard/stats` — Thống kê log 7 ngày gần nhất vẽ Biểu đồ Dashboard.
* `GET   /api/users/:id` — Xem hồ sơ chi tiết người dùng.
* `PUT   /api/users/:id` — Cập nhật Profile Jira (`jobTitle`, `department`, `company`, `phone`, `avatar`).
* `PATCH /api/users/:id/role` — Thay đổi vai trò Admin Google Workspace.
* `PATCH /api/users/:id/block` — Khóa hoặc mở khóa tài khoản người dùng (`isBlocked`).
* `GET   /api/users/:id/logs` — Xem lịch sử nhật ký hoạt động người dùng.
* `DELETE /api/users/:id` — Xóa người dùng.

### 3. Quản lý Dự án & Cây Dự án Con (`/api/projects`)
* `GET   /api/projects` — Danh sách dự án của người dùng.
* `GET   /api/projects/roots` — Danh sách các Dự án Gốc (Dự án Cha - `parentId: null`).
* `GET   /api/projects/:id/sub-projects` — Danh sách các Dự án Con của 1 Dự án Cha.
* `POST  /api/projects` — Tạo mới dự án (`name`, `code`, `parentId`, `scale`).
* `PUT   /api/projects/:id` — Cập nhật thông tin dự án.
* `DELETE /api/projects/:id` — Xóa dự án (Chỉ Owner).
* `POST  /api/projects/:id/members` — Thêm thành viên vào dự án.

### 4. Quản lý Công việc & Subtasks (`/api/tasks`)
* `GET   /api/tasks/:projectId` — Lấy danh sách Task theo dự án.
* `POST  /api/tasks` — Tạo mới Task (Kèm `dependencies` & `subtasks`).
* `POST  /api/tasks/:id/subtasks` — Thêm việc nhỏ vào Task (`$push`).
* `PATCH /api/tasks/:id/subtasks/:subtaskId/toggle` — Bật/Tắt hoàn thành việc nhỏ.
* `PUT   /api/tasks/:id/subtasks/:subtaskId` — Sửa tiêu đề việc nhỏ.
* `DELETE /api/tasks/:id/subtasks/:subtaskId` — Xóa việc nhỏ ra khỏi Task (`$pull`).

### 5. Quản lý Sprint Agile (`/api/sprints`)
* `GET   /api/sprints/project/:projectId` — Danh sách Sprint theo dự án.
* `POST  /api/sprints/project/:projectId` — Tạo Sprint mới.
* `PATCH /api/sprints/:id/start` — Kích hoạt bắt đầu Sprint (`PLANNING` ➔ `ACTIVE`).
* `PUT   /api/sprints/:id/complete` — Kết thúc Sprint (`ACTIVE` ➔ `COMPLETED`).

---

## ⚡ HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu môi trường
* Node.js version `>= 18.0.0`
* MongoDB Atlas hoặc MongoDB Local `version >= 6.0`

### 2. Khởi động Backend Server
```bash
# Di chuyển vào thư mục Backend
cd skys-workspace-be

# Cài đặt dependencies
npm install

# Khởi động Server
node server.js
```
Server Backend sẽ lắng nghe tại: `http://localhost:5000`

### 3. Khởi động Frontend App
```bash
# Di chuyển vào thư mục Frontend
cd skys-workspace-fe

# Cài đặt dependencies
npm install

# Khởi động Next.js Dev Server
npm run dev
```
Giao diện Web sẽ khởi chạy tại: `http://localhost:3000`

### 🔑 Khởi tạo Tài khoản Admin Hệ thống (Security Configuration)
Tài khoản Admin tối cao được khởi tạo tự động an toàn thông qua biến môi trường trong file `.env`:
* **Email Admin**: Đọc từ biến môi trường `ADMIN_EMAIL`
* **Mật khẩu**: Đọc từ biến môi trường `ADMIN_PASSWORD` (được tự động băm mã hóa bằng `bcrypt` trước khi lưu vào Database).


---

### 📝 LICENSE & AUTHOR
* **Dự án**: Skys Platform System
* **Bản quyền**: © 2026 Skys Platform Team. All rights reserved.
