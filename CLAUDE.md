# VibeCode

Monorepo gồm 2 source: `FE/` (Next.js) và `BE/` (Spring Boot microservice). Chưa phải git repo.

## Cấu trúc

- `FE/`: Next.js 14 (App Router) + React 18 + MUI 5 + TypeScript. Cổng 3000.
  - `src/app/{login,register,dashboard}`: các trang. `src/app/providers.tsx` chứa MUI theme và AuthProvider (phải là client component).
  - `src/context/AuthContext.tsx`: state đăng nhập, token lưu ở localStorage (`vibecode_token`).
  - `src/lib/api.ts`: gọi API, base URL lấy từ `NEXT_PUBLIC_AUTH_API` (`FE/.env.local`).
- `BE/`: Maven multi-module, Spring Boot 3.3.5, Java 17, MongoDB.
  - `auth-service` (8081): register, login, JWT, role. Package `com.vibecode.auth`.
  - `file-service` (8082): lưu ảnh/video. Hiện mới là khung, chỉ có `/api/files/ping`.
  - `business-service` (8083): logic nghiệp vụ. Hiện mới là khung, chỉ có `/api/business/ping`.
  - Chưa có API gateway, FE gọi thẳng auth-service.

## Database

Mỗi service một database riêng trên cùng MongoDB `localhost:27017`, cấu hình ở `spring.data.mongodb.uri` trong `application.yml` của từng service (`vibecode_auth`, `vibecode_file`, `vibecode_business`). Service không đọc DB của service khác, cần dữ liệu thì gọi qua API.

## Auth và role

- Role: `USER`, `ADMIN` (enum `Role`). Đăng ký công khai luôn tạo `USER`.
- Admin được seed khi auth-service khởi động: `admin@vibecode.com` (mật khẩu và các giá trị khác cấu hình ở `app.admin.*`, không commit lên git).
- JWT HS256, secret ở `app.jwt.secret` (Base64, chỉ dùng cho dev, đổi khi lên môi trường thật). Role nằm trong claim `role`.
- Endpoint: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/admin/users` (chỉ ADMIN).
- CORS cho phép các origin ở `app.cors.allowed-origin` (phân tách bằng dấu phẩy), hiện là `http://localhost:3000` và `http://localhost:3001`.

## Chạy dự án

1. Bật MongoDB local (`localhost:27017`).
2. BE: `cd BE && mvn spring-boot:run -pl auth-service` (đổi `-pl` để chạy service khác).
3. FE: `cd FE && npm install && npm run dev`, mở http://localhost:3000.

Nếu Maven báo lỗi SSL `PKIX path building failed`, chạy với `MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"` để Java dùng kho chứng chỉ của Windows.

## Quy ước

- Thông báo hiển thị cho người dùng viết bằng tiếng Việt (cả FE và message lỗi từ BE).
- Lỗi BE trả về dạng `{"message": "..."}`, FE đọc field `message`.
- Thêm service mới: tạo module trong `BE/`, khai báo vào `<modules>` của `BE/pom.xml`, cấp cổng và database riêng.
- Khi tạo file nhiều dòng có tiếng Việt bằng bash heredoc có lúc bị lỗi cú pháp, ưu tiên dùng công cụ Write.


# rule push code
- không được push code liên quan đến key, giá trị mà bảo mật lên github, ví dụ: NEXT_PUBLIC_AUTH_API=http://localhost:8081 thì chỉ dc push "NEXT_PUBLIC_AUTH_API ="  lên thôi, giá trị phía sau dấu = không dc push.
