# 📘 GIÁO TRÌNH THIẾT KẾ GIAO DIỆN CHUẨN ENTERPRISE (SaaS UI/UX) & ÔN TẬP CORE BACKEND
> **Dự án**: KS Platform (Enterprise Project & Task Management)  
> **Tác giả**: Antigravity Assistant & Developer  
> **Mục tiêu**: Nâng cấp UI/UX theo tiêu chuẩn Jira / Linear / Stripe; Làm chủ 100% các hàm Backend lõi đã viết.

---

## 🎨 CHƯƠNG 1: QUY CHUẨN THIẾT KẾ GIAO DIỆN SAAS CHUYÊN NGHIỆP (ENTERPRISE DESIGN SYSTEM)

### 1.1 Tải bỏ "Màu Neon & Shadow AI Rườm Rà" — Hướng tới Minimalism & Premium
Nhiều ứng dụng AI tạo tự động thường bị dính lỗi thiết kế:
- ❌ Dùng quá nhiều gradient phản quang, màu neon tím/xanh chói mắt (`#00FF88`, `#FF00FF`).
- ❌ Đổ bóng đậm đen rùng rợn (`box-shadow: 0 20px 50px rgba(0,0,0,0.5)`).
- ❌ Bo góc quá đà hoặc viền quá dày.

#### ✅ Bảng màu Chuẩn Enterprise (Corporate Palette):
| Nhóm màu | Mã Tailwind | Công dụng | Ví dụ HEX |
|:---|:---|:---|:---|
| **Nền chính (Background)** | `bg-slate-50` / `bg-zinc-900` | Nền toàn trang, dịu mắt | `#F8FAFC` |
| **Nền Container (Card)** | `bg-white` / `bg-zinc-800` | Khối thẻ, bảng dữ liệu | `#FFFFFF` |
| **Viền mảnh (Border)** | `border-slate-200` / `border-zinc-700` | Định hình khối sắc nét | `#E2E8F0` |
| **Chữ tiêu đề (Text High)** | `text-slate-900` / `text-zinc-100` | Tiêu đề H1, H2, H3, Name | `#0F172A` |
| **Chữ phụ (Text Muted)** | `text-slate-500` / `text-zinc-400` | Mô tả, ngày tháng, email | `#64748B` |
| **Thương hiệu (Brand Primary)** | `bg-indigo-600` / `hover:bg-indigo-700` | Nút chính, Active Tab | `#4F46E5` |
| **Thành công (Success)** | `bg-emerald-50` & `text-emerald-700` | Trạng thái `Done`, `ACTIVE` | `#059669` |
| **Cảnh báo (Warning)** | `bg-amber-50` & `text-amber-700` | Trạng thái `Review`, `InProgress` | `#D97706` |
| **Nguy hiểm (Danger)** | `bg-rose-50` & `text-rose-700` | Trạng thái `Blocked`, Nút `Delete` | `#E11D48` |

---

### 1.2 Kiểu chữ (Typography System)
- **Font khuyến nghị**: `Inter` hoặc `Plus Jakarta Sans` (Phổ biến nhất trên Jira, Linear, Vercel).
- **Hệ thống phân cấp Kích thước**:
  - `H1 (Page Header)`: `text-2xl font-bold tracking-tight text-slate-900` (24px)
  - `H2 (Section Header)`: `text-lg font-semibold text-slate-800` (18px)
  - `H3 (Card Title)`: `text-sm font-semibold text-slate-900` (14px)
  - `Body Text`: `text-sm text-slate-600 leading-relaxed` (14px)
  - `Caption / Micro Label`: `text-xs font-medium text-slate-400` (12px)

---

### 1.3 Quy chuẩn Nút bấm (Button Components System)

Một ứng dụng SaaS chuyên nghiệp luôn chia rõ 4 loại Button:

#### 1️⃣ Primary Button (Nút hành động chính — Duy nhất 1 nút nổi bật nhất trang):
```html
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm">
  + Tạo công việc mới
</button>
```

#### 2️⃣ Secondary Button (Nút hành động phụ — Hủy, Quay lại, Lọc):
```html
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors shadow-sm">
  Hủy bỏ
</button>
```

#### 3️⃣ Ghost Button (Nút icon hoặc thao tác ẩn):
```html
<button class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><!-- Icon SVG --></svg>
</button>
```

#### 4️⃣ Danger Button (Nút Xóa / Khóa tài khoản):
```html
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors">
  Xóa tài khoản
</button>
```

---

## 🎴 CHƯƠNG 2: TIÊU CHUẨN THẺ (CARDS / BADGES / STATUS PILLS) TRONG TAILWINDCSS

Thẻ (Card) là thành phần cốt lõi hiển thị dữ liệu trong SaaS UI (Kanban Task Card, Metric KPI Card, User Card).

### 2.1 Cấu trúc Thẻ Chuẩn Enterprise (Card Container)
```html
<!-- Card Container với hiệu ứng hover nhẹ, đường viền mảnh 1px, shadow-sm tinh tế -->
<div class="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
  
  <!-- Header của Card -->
  <div class="flex items-center justify-between mb-3">
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
      SKYS-102
    </span>
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
      ● In Progress
    </span>
  </div>

  <!-- Nội dung Card -->
  <h4 class="text-sm font-semibold text-slate-900 mb-1 hover:text-indigo-600 transition-colors cursor-pointer">
    Thiết kế lại giao diện Dashboard theo chuẩn Enterprise
  </h4>
  <p class="text-xs text-slate-500 line-clamp-2 mb-4">
    Loại bỏ các hiệu ứng bóng đổ neon quá đà, áp dụng hệ thống màu Slate/Zinc dịu mắt.
  </p>

  <!-- Footer của Card: Tiến độ subtask + Avatar người nhận -->
  <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
    <div class="flex items-center gap-1.5">
      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>3/5 việc nhỏ</span>
    </div>
    
    <!-- User Avatar Cluster -->
    <div class="flex items-center -space-x-2 overflow-hidden">
      <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar">
    </div>
  </div>
</div>
```

---

### 2.2 Quy chuẩn Thẻ Trạng Thái (Status Badges / Soft Pills)
Tuyệt đối **KHÔNG** dùng màu chói rực như `bg-red-500 text-white`. Dùng phong cách **Soft Palette (Nền nhạt + Chữ đậm + Viền siêu mảnh)**:

- 🟢 **Hoàn thành (`Done` / `Active`)**: `bg-emerald-50 text-emerald-700 border border-emerald-200/60`
- 🟡 **Đang làm (`InProgress` / `Review`)**: `bg-amber-50 text-amber-700 border border-amber-200/60`
- ⚪ **Chưa làm (`Todo` / `Pending`)**: `bg-slate-100 text-slate-600 border border-slate-200`
- 🔴 **Khóa / Khẩn cấp (`Urgent` / `Blocked`)**: `bg-rose-50 text-rose-700 border border-rose-200/60`

---

## 🖥️ CHƯƠNG 3: NGUYÊN TẮC THIẾT KẾ ADMIN DASHBOARD VS USER DASHBOARD

### 3.1 Giao diện Admin Dashboard (Dành cho Super Admin, User Admin)
- **Mục tiêu**: Giám sát sức khỏe hệ thống, quản lý tài khoản người dùng, xem nhật ký hoạt động chống nghẽn DB.
- **Thành phần bắt buộc**:
  1. **Khối Thẻ KPI Tổng quan (4 Thẻ chỉ số Top Header)**:
     - Total Users (Tổng người dùng)
     - Online Users (Đang hoạt động)
     - Blocked Users (Tài khoản bị khóa)
     - System Uptime / RAM Usage
  2. **Biểu đồ Nhật ký Hoạt động 7 ngày (`UserStatusLog` Chart)**:
     - Biểu đồ đường (Line Chart) hoặc Cột (Bar Chart) thể hiện lượng Login, Logout, Blocked theo ngày.
  3. **Bảng Quản lý Người dùng & Cấp quyền Google Workspace**:
     - Bảng dữ liệu (Table) hiển thị Name, Email, Google Workspace Role, Status Pill (`Online`/`Offline`), Nút Khóa (`Block`) và Nút Gán Role (`Change Role`).

---

### 3.2 Giao diện User / PM Dashboard (Dành cho Project Manager & Member)
- **Mục tiêu**: Theo dõi tiến độ công việc trong dự án, tương tác Kanban Board, quản lý Sprint và Subtask.
- **Thành phần bắt buộc**:
  1. **Cây Dự án (`Project Tree`)**: Hiển thị mối quan hệ Dự án Cha ➔ Dự án Con (`parentId`).
  2. **Thống kê Tiến độ Dự án (`Project Progress Bar`)**: % Hoàn thành task (Số task `Done` / Tổng task).
  3. **Bảng Kanban 4 Cột (`Todo` | `InProgress` | `Review` | `Done`)**:
     - Kéo thả hoặc chuyển trạng thái task.
     - Lọc task theo Đội nhóm (`FRONTEND`, `BACKEND`, `DESIGN`, `QA`, `DEVOPS`).
  4. **Thanh Đường găng PERT / CPM**: Đánh dấu màu đỏ cho các task nằm trên đường găng nguy cơ trễ hạn.

---

## 🎓 CHƯƠNG 4: THỰC HÀNH & BẢO VỆ CÁC HÀM CORE BACKEND ĐÃ VIẾT

Chúng ta cùng ôn lại và khắc sâu bản chất 5 hàm lõi quan trọng nhất trong hệ thống Backend của bạn:

### 1️⃣ Hàm Phân quyền Đội nhóm (`checkTaskPermission`)
- **Vị trí**: `src/modules/tasks/task.service.js`
- **Bản chất**: 
  - `PROJECT_MANAGER` có quyền trên MỌI task.
  - `Assignee` (Người được giao) luôn có quyền trên task của mình.
  - `FRONTEND_LEAD` chỉ có quyền trên Task thuộc nhóm Frontend. Ngăn chặn tuyệt đối việc `FRONTEND_LEAD` sửa nhầm task của Backend/Design.

### 2️⃣ Hàm Ánh xạ Đội nhóm Tập trung (`TEAM_MAP`)
- **Vị trí**: `src/shared/constants/teamRoles.js`
- **Bản chất**: Gom các vai trò lẻ (`FRONTEND_LEAD`, `FRONTEND_DEVELOPER`, `FRONTEND_MEMBER`) thành 1 hằng số duy nhất `FRONTEND`. Giúp chuyển đổi mượt mà giữa Server và Client.

### 3️⃣ Hàm Mã hóa băm OTP Quên mật khẩu (`crypto.createHash`)
- **Vị trí**: `src/modules/auth/auth.service.js`
- **Bản chất**: Sử dụng thuật toán **SHA-256** băm mã OTP 6 số thành chuỗi 64 ký tự trước khi lưu vào DB. Đảm bảo chuẩn bảo mật OWASP: Dù DB bị leak, hacker cũng không xem được OTP thật.

### 4️⃣ Hàm Tự động gửi Email & Ethereal Fallback (`sendEmail`)
- **Vị trí**: `src/shared/utils/sendEmail.js`
- **Bản chất**: Nếu cấu hình đủ `EMAIL_USER` và `EMAIL_PASS` trong `.env` ➔ Gửi mail thật qua Gmail. Nếu thiếu ➔ Tự động tạo tài khoản Ethereal giả lập và in link xem mail trực tiếp ra Console Log mà không bị crash server.

### 5️⃣ Hàm Bắt lỗi Bất đồng bộ (`asyncHandler`)
- **Vị trí**: `src/shared/asyncHandler.js`
- **Bản chất**: Bọc các hàm `async (req, res)` trong Controller. Tự động đẩy exception về `errorHandler` middleware bằng `.catch(next)`, giúp code Controller cực kỳ ngắn gọn không cần lặp lại khối `try-catch`.

---

## 🗺️ CHƯƠNG 5: LỘ TRÌNH THỰC HIỆN TÁI CẤU TRÚC GIAO DIỆN HƯỚNG TỚI HOÀN THIỆN 100%

Chúng ta sẽ chia công việc làm **4 giai đoạn rõ ràng**:

```
GIAI ĐOẠN 1: Chuẩn hóa Hệ thống Design Tokens & Component CSS (Màu sắc, Typography, Buttons, Badges)
GIAI ĐOẠN 2: Xây dựng Giao diện Admin Dashboard (Biểu đồ 7 ngày Log, Bảng User & Cấp quyền Admin)
GIAI ĐOẠN 3: Xây dựng Giao diện User Dashboard & Dự án (Cây dự án, Tiến độ %, Bộ lọc Đội nhóm)
GIAI ĐOẠN 4: Hoàn thiện Bảng Kanban Task, Tệp đính kèm & Tích hợp API Backend 100%
```

---

> 🎉 **Bạn đã sở hữu toàn bộ kiến thức và chuẩn mực thiết kế Enterprise!**  
> Hãy cùng bắt đầu bước vào **Giai đoạn 1** để nâng cấp giao diện chuẩn đẹp nhé!
