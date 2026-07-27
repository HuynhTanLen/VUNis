# 📚 SKYS PLATFORM — ÔN TẬP BACKEND TOÀN DIỆN & HƯỚNG DẪN VIẾT LẠI ĐÚNG CẤU TRÚC
> *Tài liệu Ôn luyện Express.js + MongoDB + Kiến trúc Module cho Nhà phát triển*

---

## 📋 MỤC LỤC
1. [Kiến trúc Tổng thể Backend](#1-kiến-trúc-tổng-thể-backend)
2. [Mô hình 6 Tầng trong Mỗi Module](#2-mô-hình-6-tầng-trong-mỗi-module)
3. [Ôn tập MongoDB & Mongoose (NoSQL Đúng Cách)](#3-ôn-tập-mongodb--mongoose-nosql-đúng-cách)
4. [Phân tích Code Hiện tại: Điểm Tốt & Điểm Cần Sửa](#4-phân-tích-code-hiện-tại-điểm-tốt--điểm-cần-sửa)
5. [Hướng dẫn Viết lại Từng Module Chi tiết](#5-hướng-dẫn-viết-lại-từng-module-chi-tiết)
6. [Tổng kết Checklist Viết lại Backend](#6-tổng-kết-checklist-viết-lại-backend)

---

## 1. KIẾN TRÚC TỔNG THỂ BACKEND

### 🏗️ Sơ đồ Luồng Request → Response:

```
Client (Browser / Postman)
  │  HTTP Request (POST /api/auth/login)
  ▼
┌────────────────────────────────────────────────┐
│  server.js — Kết nối MongoDB + Khởi động HTTP  │
└─────────────────────┬──────────────────────────┘
                      ▼
┌────────────────────────────────────────────────┐
│  app.js — Middleware toàn cục + Đăng ký Routes │
│  cookieParser → json → cors → logger → routes  │
└─────────────────────┬──────────────────────────┘
                      ▼
┌────────────────────────────────────────────────┐
│  Middleware Pipeline (xử lý tuần tự)           │
│  1. cookieParser() → Đọc cookies               │
│  2. express.json() → Parse body JSON            │
│  3. cors()         → Cho phép cross-origin      │
│  4. logger         → In log request             │
│  5. globalLimiter  → Giới hạn request/phút      │
│  6. protect        → Xác thực JWT (nếu cần)     │
│  7. authorize      → Kiểm tra quyền RBAC        │
└─────────────────────┬──────────────────────────┘
                      ▼
┌────────────────────────────────────────────────┐
│  Route → Controller → Service → Repository     │
│                                                │
│  Route:      Định nghĩa URL + method           │
│  Controller: Nhận req → tạo DTO → gọi Service  │
│  Service:    Xử lý logic nghiệp vụ             │
│  Repository: Truy vấn MongoDB                  │
│  Schema:     Định nghĩa cấu trúc Document      │
│  Mapper:     Chuyển DB data → Response sạch     │
└────────────────────────────────────────────────┘
```

### 📂 Cấu trúc Thư mục Hiện tại:
```
server/
├── server.js              ← Kết nối DB + Khởi động HTTP
├── .env                   ← Biến môi trường
├── package.json           ← Dependencies
└── src/
    ├── app.js             ← Cấu hình Express
    ├── config/
    │   ├── env.js         ← Đọc biến .env
    │   └── database.js    ← Kết nối MongoDB + Seed
    ├── middleware/
    │   ├── auth.middleware.js      ← Xác thực JWT
    │   ├── rbac.middleware.js      ← Phân quyền
    │   ├── error.middleware.js     ← Xử lý lỗi 404/500
    │   ├── logger.middleware.js    ← Ghi log
    │   └── rateLimit.middleware.js ← Giới hạn request
    ├── shared/
    │   └── errors/AppError.js     ← Base Error class
    └── modules/
        ├── auth/          (8 files)
        ├── projects/      (8 files)
        ├── tasks/         (8 files)
        ├── sprints/       (8 files)
        ├── projectMembers/ ← ⚠️ Nên nhúng vào Project
        ├── comments/
        ├── notifications/
        ├── activityLogs/
        ├── roles/         ← ⚠️ Quá phức tạp, nên đơn giản hóa
        ├── permissions/   ← ⚠️ Quá phức tạp, nên đơn giản hóa
        ├── labels/
        └── attachments/
```

---

## 2. MÔ HÌNH 6 TẦNG TRONG MỖI MODULE

Mỗi module gồm **6 file chính**, mỗi file 1 nhiệm vụ duy nhất:

```
┌─────────────────────────────────────────────────────┐
│  1. SCHEMA (.schema.js)                              │
│  → Định nghĩa cấu trúc Document MongoDB             │
│  → VD: userSchema = new mongoose.Schema({ name })    │
├─────────────────────────────────────────────────────┤
│  2. DTO (.dto.js)                                    │
│  → Làm sạch & validate dữ liệu đầu vào             │
│  → VD: new RegisterDTO(req.body).validate()          │
├─────────────────────────────────────────────────────┤
│  3. REPOSITORY (.repository.js)                      │
│  → CHỈ chứa truy vấn Database                       │
│  → VD: User.findOne({ email }), User.create(data)    │
├─────────────────────────────────────────────────────┤
│  4. SERVICE (.service.js)                            │
│  → Xử lý logic nghiệp vụ                            │
│  → VD: hash password → repo.create → tạo token      │
├─────────────────────────────────────────────────────┤
│  5. CONTROLLER (.controller.js)                      │
│  → Nhận request → tạo DTO → gọi Service → trả res   │
│  → VD: const dto = new RegisterDTO(req.body)         │
├─────────────────────────────────────────────────────┤
│  6. ROUTE (.route.js)                                │
│  → Khai báo URL path + HTTP method + middleware      │
│  → VD: router.post('/login', loginUser)              │
└─────────────────────────────────────────────────────┘

Bonus:
  • ERROR (.error.js)  → Lỗi riêng (EmailExistsError...)
  • MAPPER (.mapper.js) → Chuyển DB data → Response sạch
```

### 🔑 Quy tắc Vàng — Ai làm gì:
| Tầng | ĐƯỢC làm | KHÔNG ĐƯỢC làm |
|:---|:---|:---|
| **Schema** | Định nghĩa trường, enum, validate Mongoose | Chứa logic nghiệp vụ |
| **DTO** | Validate input, trim, lowercase | Truy vấn DB |
| **Repository** | findOne, create, update, delete | Hash password, tạo JWT |
| **Service** | Gọi Repo, xử lý logic, throw Error | Trả `res.json()` |
| **Controller** | Tạo DTO, gọi Service, trả `res.json()` | Viết query MongoDB |
| **Route** | Khai báo path, gắn middleware | Chứa logic nghiệp vụ |

---

## 3. ÔN TẬP MONGODB & MONGOOSE (NOSQL ĐÚNG CÁCH)

### 🧠 3.1 MongoDB KHÔNG PHẢI SQL
```
SQL (MySQL):                      MongoDB (NoSQL):
┌────────────┐                    ┌────────────────────┐
│ Table Users │                   │ Collection: users   │
│ id | name  │                    │ Document: {         │
│ 1  | Len   │                    │   _id: ObjectId,    │
│ 2  | An    │                    │   name: "Len",      │
└────────────┘                    │   subtasks: [...]    │ ← Nhúng trực tiếp!
                                  │ }                    │
                                  └────────────────────┘
```

### 🧠 3.2 Nhúng (Embed) vs Tham chiếu (Reference)
| Tiêu chí | Nhúng (Embed) | Tham chiếu (Ref) |
|:---|:---|:---|
| **Khi nào** | Dữ liệu thuộc về cha, ít biến động | Dữ liệu độc lập, dùng chung nhiều nơi |
| **Ví dụ** | `subtasks` trong Task | `userId` tham chiếu User |
| **Ưu** | 1 query lấy hết, siêu nhanh | Không trùng lặp dữ liệu |
| **Nhược** | Document có thể phình to (giới hạn 16MB) | Cần `populate()` = chậm hơn |

### 🧠 3.3 Cú pháp Schema Mongoose:
```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // String + required + trim
    title: { type: String, required: [true, 'Bắt buộc'], trim: true },
    
    // Enum (chỉ chấp nhận giá trị cố định)
    status: { type: String, enum: ['Todo', 'InProgress', 'Done'], default: 'Todo' },
    
    // Tham chiếu (Reference)
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    
    // Mảng nhúng (Embedded Subdocument)
    subtasks: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    
    // Ngày giờ
    startDate: { type: Date },
    endDate: { type: Date }
}, { timestamps: true });  // Tự động thêm createdAt, updatedAt

module.exports = mongoose.model('Task', taskSchema);
```

### 🧠 3.4 Các Phương thức Truy vấn:
```javascript
// TÌM 1 document
const user = await User.findOne({ email: 'admin@skys.com' });

// TÌM theo ID
const task = await Task.findById('60d5ec49f1a2c8b1f8e4e1a2');

// TÌM NHIỀU
const tasks = await Task.find({ projectId: 'xxx', status: 'Todo' });

// TẠO MỚI
const newTask = await Task.create({ title: 'Việc A', projectId: 'xxx' });

// CẬP NHẬT (trả về document mới nhờ { new: true })
const updated = await Task.findByIdAndUpdate(id, { status: 'Done' }, { new: true });

// XÓA
await Task.findByIdAndDelete(id);

// POPULATE (Lấy dữ liệu từ collection tham chiếu)
const task = await Task.findById(id).populate('projectId', 'name status');
// → task.projectId = { _id, name, status } thay vì chỉ ObjectId string
```

---

## 4. PHÂN TÍCH CODE HIỆN TẠI: ĐIỂM TỐT & ĐIỂM CẦN SỬA

### ✅ 5 Điểm Tốt (Giữ nguyên):

1. **Kiến trúc Module 6 tầng** — Phân tách rõ ràng, dễ bảo trì
2. **Base Error Class** — `AppError` kế thừa chuẩn với `statusCode` + `error code`
3. **JWT qua HttpOnly Cookie** — Bảo mật chống XSS
4. **DTO validate** — Chặn dữ liệu xấu trước khi vào Service
5. **Mapper** — Che giấu `password` và dữ liệu nhạy cảm

### ⚠️ 6 Điểm Cần Sửa:

---

#### ❌ Vấn đề 1: User Schema thiếu trường quan trọng
**File**: [auth.schema.js](file:///d:/DuAnReach/skys-workspace/skys-workspace-be/server/src/modules/auth/auth.schema.js)

**Hiện tại thiếu**: `isBlocked`, `lastActiveAt`
```diff
+    isBlocked: { type: Boolean, default: false },
+    lastActiveAt: { type: Date, default: Date.now },
```
> Không có `isBlocked` → Admin không thể khóa tài khoản.
> Không có `lastActiveAt` → Không phát hiện được tài khoản Inactive.

---

#### ❌ Vấn đề 2: Role tham chiếu ObjectId → Quá phức tạp
**File**: [auth.schema.js](file:///d:/DuAnReach/skys-workspace/skys-workspace-be/server/src/modules/auth/auth.schema.js) dòng 32-36

```javascript
// Hiện tại: Phải populate() mỗi lần query → chậm
role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }

// Nên đổi thành string enum đơn giản:
role: { type: String, enum: ['admin', 'lead', 'member'], default: 'member' }
```
> Hệ thống đang có 3 module riêng biệt cho Roles/Permissions/RBAC → Quá nặng cho dự án quy mô nhỏ-vừa.

---

#### ❌ Vấn đề 3: Auth Middleware không kiểm tra User trong DB
**File**: [auth.middleware.js](file:///d:/DuAnReach/skys-workspace/skys-workspace-be/server/src/middleware/auth.middleware.js) dòng 23-24

```javascript
// Hiện tại: Chỉ decode JWT, KHÔNG kiểm tra user bị xóa/khóa
const decoded = jwt.verify(token, env.JWT_SECRET);
req.user = decoded;  // decoded chỉ có { userId, email, roleName }
```
> **Rủi ro**: Admin xóa/khóa tài khoản → Token cũ vẫn hoạt động đến khi hết hạn!

---

#### ❌ Vấn đề 4: Controller lặp try-catch ở mọi hàm
**File**: [auth.controller.js](file:///d:/DuAnReach/skys-workspace/skys-workspace-be/server/src/modules/auth/auth.controller.js)

```javascript
// Hiện tại: Copy-paste try-catch giống nhau ở 11 hàm controller
const registerUser = async (req, res) => {
    try { ... } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
// Nên dùng asyncHandler wrapper để loại bỏ hoàn toàn try-catch
```

---

#### ❌ Vấn đề 5: ProjectMembers là bảng riêng → Nên nhúng vào Project
**Hiện tại**: Module `projectMembers/` riêng biệt

> Trong MongoDB, danh sách thành viên (thường < 50 người) nên nhúng trực tiếp vào Document Project. Hiện tại `project.schema.js` đã có trường `members: [ObjectId]` nhưng lại đồng thời tạo thêm collection `ProjectMember` riêng → **trùng lặp dữ liệu**, phải đồng bộ 2 nơi.

---

#### ❌ Vấn đề 6: Project Schema dùng "budget" → Nên đổi thành "scale"
**File**: [project.schema.js](file:///d:/DuAnReach/skys-workspace/skys-workspace-be/server/src/modules/projects/project.schema.js)

```javascript
// Hiện tại:
budget: { type: mongoose.Schema.Types.Decimal128, default: 0 }

// Nên đổi thành:
scale: { type: String, enum: ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'], default: 'MEDIUM' }
```

---

## 5. HƯỚNG DẪN VIẾT LẠI TỪNG MODULE CHI TIẾT

### 📝 5.1 AUTH — Viết lại User Schema + Auth Middleware

#### Bước 1: Sửa `auth.schema.js` (Phân quyền chuẩn Google Workspace)
```javascript
const mongoose = require('mongoose');

// Danh sách các cấp độ Admin chuẩn Google Workspace
const ADMIN_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',          // Quản trị viên tối cao (Full quyền hệ thống)
    USER_ADMIN: 'USER_ADMIN',            // Quản trị người dùng (Tạo, khóa/mở khóa, đổi pass, theo dõi log)
    GROUPS_ADMIN: 'GROUPS_ADMIN',        // Quản trị nhóm & gán thành viên vào nhóm/dự án
    SERVICE_ADMIN: 'SERVICE_ADMIN',      // Quản trị dịch vụ (Quản lý dự án, cấu hình quy mô, sprint)
    HELP_DESK_ADMIN: 'HELP_DESK_ADMIN',  // Quản trị hỗ trợ (Reset pass, xem log hoạt động, hỗ trợ user)
    USER: 'USER'                         // Người dùng thông thường (Quyền phụ thuộc vào vai trò trong dự án)
};

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    
    // Phân quyền Hệ thống chuẩn Google Workspace (Chuỗi Enum đơn giản, không dùng ObjectId)
    role: { 
        type: String, 
        enum: Object.values(ADMIN_ROLES), 
        default: ADMIN_ROLES.USER 
    },
    
    // BỔ SUNG Quản lý trạng thái theo dõi người dùng (User Monitoring & Blocking)
    status: { 
        type: String, 
        enum: ['online', 'offline', 'inactive_long', 'suspended'], 
        default: 'offline' 
    },
    isBlocked: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
    
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
module.exports.ADMIN_ROLES = ADMIN_ROLES;
```

#### Bước 2: Sửa `auth.middleware.js` (Xác thực JWT + Kiểm tra User bị khóa)
```javascript
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../modules/auth/auth.schema');

const protect = async (req, res, next) => {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Chưa đăng nhập, vui lòng truy cập token hợp lệ' });

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        
        // Truy vấn DB kiểm tra User có tồn tại & có bị Admin khóa không
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(401).json({ message: 'Tài khoản không còn tồn tại trên hệ thống' });
        if (user.isBlocked) return res.status(403).json({ message: 'Tài khoản của bạn đã bị Admin khóa' });
        
        // Cập nhật thời gian hoạt động gần nhất
        user.lastActiveAt = new Date();
        user.status = 'online';
        await user.save();
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token hết hạn hoặc không hợp lệ' });
    }
};

module.exports = { protect };
```

#### Bước 3: Tạo `asyncHandler` (Loại bỏ try-catch lặp ở các Controller)
```javascript
// src/shared/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports = asyncHandler;
```

#### Bước 4: Viết lại `rbac.middleware.js` (Phân quyền theo Google Workspace Admin Hierarchy)
```javascript
/**
 * Middleware phân quyền Hệ thống (System-Level RBAC) theo chuẩn Google Workspace.
 * Super Admin luôn có toàn quyền vượt qua mọi bước kiểm tra.
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa đăng nhập' });
        }

        // 1. SUPER_ADMIN có full quyền toàn hệ thống
        if (req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        // 2. Kiểm tra nếu vai trò của User thuộc danh sách được phép
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({ 
            message: `Truy cập bị từ chối. Chức năng này yêu cầu quyền: ${allowedRoles.join(', ')}` 
        });
    };
};

/**
 * Middleware phân quyền Dự án (Project-Level Scoped RBAC).
 * Kiểm tra xem người dùng có phải là Owner hoặc có vai trò phù hợp trong mảng members nhúng của Project.
 */
const checkProjectPermission = (...allowedProjectRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });

            // SUPER_ADMIN hoặc SERVICE_ADMIN toàn hệ thống được phép truy cập xem mọi dự án
            if (['SUPER_ADMIN', 'SERVICE_ADMIN'].includes(req.user.role)) {
                return next();
            }

            const projectId = req.params.projectId || req.params.id || req.body.projectId;
            if (!projectId) return res.status(400).json({ message: 'Thiếu ID dự án' });

            const Project = require('../modules/projects/project.schema');
            const project = await Project.findById(projectId);
            if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

            // Owner dự án có full quyền trong dự án đó
            if (project.owner.toString() === req.user._id.toString()) {
                req.currentProject = project;
                return next();
            }

            // Tìm thông tin member trong mảng nhúng members của Project (Không cần query bảng phụ!)
            const memberInfo = project.members.find(
                m => m.userId.toString() === req.user._id.toString()
            );

            if (!memberInfo) {
                return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
            }

            if (allowedProjectRoles.length > 0 && !allowedProjectRoles.includes(memberInfo.role)) {
                return res.status(403).json({ 
                    message: `Vai trò trong dự án '${memberInfo.role}' không đủ quyền thực hiện hành động này` 
                });
            }

            req.projectMember = memberInfo;
            req.currentProject = project;
            next();
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi kiểm tra quyền dự án: ' + err.message });
        }
    };
};

module.exports = { authorize, checkProjectPermission };
```

---

### 📝 5.2 PROJECT — Nhúng Members + Cây Dự án + Scale

#### Sửa `project.schema.js`
```javascript
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    code: { type: String, unique: true },           // Mã dự án: SKYS-01
    
    // Cây dự án
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    
    status: { 
        type: String, 
        enum: ['PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'], 
        default: 'PLANNING' 
    },
    scale: { 
        type: String, 
        enum: ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'], 
        default: 'MEDIUM' 
    },
    
    startDate: { type: Date },
    endDate: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // NHÚNG members trực tiếp (thay vì bảng riêng)
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Leader', 'Member', 'Viewer'], default: 'Member' },
        joinedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
```

---

### 📝 5.3 TASK — Dependencies cho PERT + Subtasks Embed

#### Sửa `task.schema.js`
```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
    
    status: { type: String, enum: ['Todo', 'InProgress', 'Review', 'Done'], default: 'Todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    
    startDate: { type: Date },
    endDate: { type: Date },
    durationDays: { type: Number, default: 1 },
    
    // Phụ thuộc công việc (cho PERT Chart)
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    
    // Nhúng Subtasks
    subtasks: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }]
}, { timestamps: true });

taskSchema.index({ projectId: 1, status: 1 });
module.exports = mongoose.model('Task', taskSchema);
```

---

### 📝 5.4 USER STATUS LOG — Bảng Log riêng chống nghẽn

#### Tạo mới `userStatusLog.schema.js`
```javascript
const mongoose = require('mongoose');

const userStatusLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ['LOGIN', 'LOGOUT', 'PING', 'BLOCKED', 'UNBLOCKED'], required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now }
});

// TTL Index: Tự động xóa sau 90 ngày
userStatusLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('UserStatusLog', userStatusLogSchema);
```

---

## 6. TỔNG KẾT CHECKLIST VIẾT LẠI BACKEND

### ✅ Giai đoạn 1: Chuẩn hóa Nền tảng
- [ ] Sửa `auth.schema.js`: Thêm `isBlocked`, `lastActiveAt`, đổi `role` → string enum
- [ ] Sửa `auth.middleware.js`: Kiểm tra user tồn tại + chưa bị khóa
- [ ] Tạo `asyncHandler.js`: Loại bỏ try-catch
- [ ] Sửa tất cả Controller: Dùng `asyncHandler`
- [ ] Đơn giản hóa `rbac.middleware.js` → `checkRole`
- [ ] Xóa module `roles/` và `permissions/`

### ✅ Giai đoạn 2: Chuẩn hóa Schema NoSQL
- [ ] Sửa `project.schema.js`: Nhúng `members[]`, thêm `parentId`, `scale`, `code`
- [ ] Xóa module `projectMembers/`: Chuyển logic vào Project service
- [ ] Sửa `task.schema.js`: Thêm `dependencies[]`, `durationDays`
- [ ] Tạo `userStatusLog.schema.js`

### ✅ Giai đoạn 3: API & Test
- [ ] Viết API khóa/mở khóa tài khoản
- [ ] Viết API cây dự án (lấy project theo parentId)
- [ ] Test toàn bộ bằng Postman
- [ ] Chạy `npm start` kiểm tra không lỗi

---

> [!TIP]
> **Mẹo Học tập**: Mỗi khi sửa 1 file, tự hỏi:
> 1. File này thuộc **tầng nào** trong mô hình 6 tầng?
> 2. Nó có đang làm **đúng nhiệm vụ** của tầng đó không?
> 3. Dữ liệu này nên **nhúng** hay **tham chiếu**?
