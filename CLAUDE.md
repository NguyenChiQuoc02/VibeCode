# VibeCode

Monorepo gồm 2 source: `FE/` (Next.js) và `BE/` (Spring Boot microservice). Chưa phải git repo.

## Cấu trúc

- `FE/`: Next.js 14 (App Router) + React 18 + MUI 5 + TypeScript. Cổng 3000.
  - `src/app/{login,register,dashboard}`: các trang. `src/app/providers.tsx` chứa MUI theme và AuthProvider (phải là client component).
  - `src/context/AuthContext.tsx`: state đăng nhập, token lưu ở localStorage (`vibecode_token`).
  - `src/lib/api.ts`: gọi API, base URL lấy từ `NEXT_PUBLIC_AUTH_API`, `NEXT_PUBLIC_BUSINESS_API`, `NEXT_PUBLIC_FILE_API` (`FE/.env.local`).
  - `src/app/dashboard/{map,holidays,landmarks,destinations}`: bản đồ Leaflet + OSM (lọc tỉnh/xã). `landmarks` có trang riêng (danh sách phân trang phía server, chi tiết `[id]`, form `new` và `[id]/edit`); `holidays`, `destinations` dùng bộ ba `CrudPage` (danh sách), `CrudDetail` (chi tiết), `CrudForm` (thêm/sửa) trong `src/components/`, cấu hình trường ở `src/lib/crudConfigs.tsx`. Mọi màn xem chi tiết, thêm, sửa đều là trang riêng (`/new`, `/[id]`, `/[id]/edit`), không dùng popup; chỉ xác nhận xóa dùng hộp thoại. Ảnh nào cũng bấm được để mở popup xem lớn (`ImageLightbox`, `PreviewImage`).
  - `src/lib/navigation.tsx` là nguồn duy nhất cho menu, tiêu đề trang, icon và tiêu đề tab trình duyệt. Thêm menu thì thêm một dòng ở đây.
  - Giao diện bám mockup: sidebar trắng có tranh minh họa, header trắng mờ có ô tìm kiếm, thẻ bo góc 12, màu chủ đạo xanh lá `#00A76F`.
- `BE/`: Maven multi-module, Spring Boot 3.3.5, Java 17, MongoDB.
  - `auth-service` (8081): register, login, JWT, role. Package `com.vibecode.auth`.
  - `file-service` (8082): `POST /api/files` (multipart `file`) đẩy file lên Cloudinary rồi trả `{url, publicId, resourceType, format, bytes, originalName}`. Nhận ảnh png/jpg/webp/gif (≤10MB), video mp4/webm/mov (≤100MB), tài liệu pdf/doc(x)/xls(x)/ppt(x)/csv/txt (≤10MB, resource_type `raw`). Không lưu file trên đĩa và chưa lưu metadata. Cấu hình bằng biến môi trường `CLOUDINARY_URL` (`cloudinary://API_KEY:API_SECRET@CLOUD_NAME`) hoặc `BE/file-service/application-local.yml` (gitignore, mẫu ở `application-local.yml.example`). Không commit khóa. Chưa xác thực.
  - `business-service` (8083): dữ liệu nghiệp vụ, package `com.vibecode.business`. Có `/api/business/ping`, dữ liệu hành chính + polygon (`/provinces`, `/wards?provinceCode=`, thêm `geometry=true` để lấy polygon), CRUD `/holidays`, `/destinations` (trả mảng), và `/landmarks` (danh sách trả `{items,total,page,size}` có lọc `q, provinceCode, status, category, level, page, size`; thêm `/landmarks/stats`, `/landmarks/markers`). Landmark có trạng thái `ACTIVE|PAUSED|DELETED`, xóa ở giao diện là xóa mềm. Chưa có xác thực JWT.
  - Chưa có API gateway, FE gọi thẳng auth-service.

## Database

Mỗi service một database riêng trên cùng MongoDB `localhost:27017`, cấu hình ở `spring.data.mongodb.uri` trong `application.yml` của từng service (`vibecode_auth`, `vibecode_file`, `vibecode_business`).

`vibecode_business` có các collection: `provinces` (34 tỉnh/thành), `wards` (3321 xã/phường), cả hai kèm `geometry` GeoJSON đã làm đơn giản; `holidays` (ngày lễ), `landmarks` (di tích, danh thắng), `destinations` (địa điểm du lịch). Dữ liệu tỉnh/xã theo mô hình 2 cấp sau sáp nhập 2025, mã (`code`) theo mã hành chính chính thức, nguồn tên là provinces.open-api.vn/api/v2, nguồn polygon là repo thanglequoc/vietnamese-provinces-database. `holidays` do ta tự soạn. `landmarks` (hơn 2000) và `destinations` (hơn 3800) gồm một ít bản ghi thủ công (`source = "Thủ công"`) cộng dữ liệu thu thập từ OpenStreetMap (Overpass, giấy phép ODbL) và Wikidata (`source = "OpenStreetMap" | "Wikidata"`, `source_id` duy nhất). Mỗi bản ghi có `url_image` (liên kết ảnh Wikimedia Commons, có thể rỗng) và tỉnh/xã gán theo polygon. Không được có bản ghi trùng: cùng tên chuẩn hóa và cách nhau dưới 2 km, kể cả giữa hai collection.

Seed và pipeline dữ liệu nằm ở thư mục `script/` ở gốc dự án, **được gitignore và không push lên GitHub** (chỉ có trên máy local): `holidays.js`, `landmarks.js` (+ `landmarks_migrate_v2.js`), `destinations.js` chạy bằng `mongosh <uri> <file>`, chỉ thay bản ghi thủ công. Thu thập dữ liệu ở `script/crawl/` (Python 3.11, cần `pymongo`, `shapely`): `build_places.py` gộp và khử trùng từ file Overpass/Wikidata đã tải về, `enrich_images.py batch` rồi `import_places.py` nạp vào Mongo, `enrich_images.py search` bổ sung ảnh chậm (có thể dừng và chạy lại), `verify_places.py` kiểm tra trùng. Wikimedia giới hạn tốc độ nên đừng chạy song song. Script nạp polygon tỉnh/xã không nằm trong repo. Service không đọc DB của service khác, cần dữ liệu thì gọi qua API.

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
- Không được push code liên quan đến key, giá trị mà bảo mật lên github, ví dụ: NEXT_PUBLIC_AUTH_API=http://localhost:8081 thì chỉ dc push "NEXT_PUBLIC_AUTH_API ="  lên thôi, giá trị phía sau dấu = không dc push.
- Các file liên quan đến nạp dữ liệu vào mongo/superset,... và craw thì bỏ vào folder /script và cho vào gitignore không dc push code lên.