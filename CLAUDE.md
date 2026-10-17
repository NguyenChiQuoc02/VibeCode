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
  - `recommend-service` (8084): **Python 3.10 + FastAPI**, nằm ở `BE/recommend-service/` (không thuộc Maven `<modules>`). Gợi ý tour và địa điểm lân cận. Lấy dữ liệu qua API của business-service (tour, đăng ký bằng tài khoản dịch vụ ADMIN, địa điểm), không đọc DB service khác. Mô hình dựng trong bộ nhớ và làm mới mỗi `REFRESH_SECONDS` (mặc định 300s): lọc cộng tác theo item (cosine trên ma trận người dùng x tour từ đăng ký và sự kiện hành vi) kết hợp độ giống nội dung (điểm đến chung, khoảng cách địa lý, giá, số ngày) và độ phổ biến. Endpoint `/api/recommend/`: `tours/popular`, `tours/{id}/similar`, `places/{id}/nearby` (công khai), `me` (cần JWT), `events` (ghi sự kiện, JWT tùy chọn), `metrics`, `refresh` (ADMIN), `status`, `ping`. Sự kiện hành vi (VIEW_TOUR, FAVORITE_TOUR, VIEW_PLACE, SEARCH, RECOMMEND_VIEW, RECOMMEND_CLICK) lưu ở MongoDB riêng `vibecode_recommend.events`. Người dùng được định danh bằng email (đăng ký tour chỉ có `userEmail`, không có userId). Token do jjwt ký bằng HS384 chứ không phải HS256 (thuật toán tự chọn theo độ dài khóa). Cấu hình ở `BE/recommend-service/.env` (gitignore, mẫu `.env.example`): `SERVICE_EMAIL/PASSWORD`, `JWT_SECRET`... FE gọi qua `NEXT_PUBLIC_RECOMMEND_API`, ghi sự kiện bằng `src/lib/track.ts`, hiển thị bằng `RecommendedTours` (tour tương tự, dành cho bạn, đang được quan tâm) và `NearbyPlaces`. Trường `bestSeason` của địa điểm gần như trống nên chưa dùng làm yếu tố "hợp mùa".
  - Chưa có API gateway, FE gọi thẳng auth-service.

## Xe hơi (AutoDrive)

- business-service: `cars` (hơn 4600 mẫu, 634 hãng, nguồn Wikidata CC0), `car_brands`, `car_test_drives`. API `/api/business/cars` (trả `{items,total,page,size}`, lọc `q, brand, bodyType, fuel, minPrice, maxPrice, hasImage, featured`; thêm `/all`, `/stats`), `/car-brands`, `/test-drives` (người dùng đặt/hủy lịch của mình, ADMIN đổi trạng thái PENDING|CONFIRMED|COMPLETED|CANCELLED). GET công khai, ghi cần ADMIN. Giá, số chỗ, nhiên liệu, kiểu thân xe **không có trong Wikidata**: giá là ước tính theo phân khúc hãng (`priceEstimated = true`), kiểu thân xe suy ra từ nhãn lớp trên Wikidata.
- FE khách: `/cars` (landing AutoDrive), `/cars/catalog`, `/cars/[id]` (đặt lịch lái thử), `/cars/my-test-drives`; giao diện ở `components/cars/` (token ở `theme.ts`, màu đỏ `#F43F55`). FE quản trị: `/dashboard/{car-brands,cars,test-drives}` trong nhóm menu "Quản lý xe hơi". Không làm recommend cho xe hơi.
- Dữ liệu: `script/crawl/crawl_cars.py` rồi `import_cars.py` (nạp cars, car_brands và menu), chạy bằng `py -3.11`.

## Database

Mỗi service một database riêng trên cùng MongoDB `localhost:27017`, cấu hình ở `spring.data.mongodb.uri` trong `application.yml` của từng service (`vibecode_auth`, `vibecode_file`, `vibecode_business`).

`vibecode_business` có các collection: `provinces` (34 tỉnh/thành), `wards` (3321 xã/phường), cả hai kèm `geometry` GeoJSON đã làm đơn giản; `holidays` (ngày lễ), `landmarks` (di tích, danh thắng), `destinations` (địa điểm du lịch). Dữ liệu tỉnh/xã theo mô hình 2 cấp sau sáp nhập 2025, mã (`code`) theo mã hành chính chính thức, nguồn tên là provinces.open-api.vn/api/v2, nguồn polygon là repo thanglequoc/vietnamese-provinces-database. `holidays` do ta tự soạn. `landmarks` (hơn 2000) và `destinations` (hơn 3800) gồm một ít bản ghi thủ công (`source = "Thủ công"`) cộng dữ liệu thu thập từ OpenStreetMap (Overpass, giấy phép ODbL) và Wikidata (`source = "OpenStreetMap" | "Wikidata"`, `source_id` duy nhất). Mỗi bản ghi có `url_image` (liên kết ảnh Wikimedia Commons, có thể rỗng) và tỉnh/xã gán theo polygon. Không được có bản ghi trùng: cùng tên chuẩn hóa và cách nhau dưới 2 km, kể cả giữa hai collection.

Seed và pipeline dữ liệu nằm ở thư mục `script/` ở gốc dự án, **được gitignore và không push lên GitHub** (chỉ có trên máy local): `holidays.js`, `landmarks.js` (+ `landmarks_migrate_v2.js`), `destinations.js` chạy bằng `mongosh <uri> <file>`, chỉ thay bản ghi thủ công. Thu thập dữ liệu ở `script/crawl/` (Python 3.11, cần `pymongo`, `shapely`): `build_places.py` gộp và khử trùng từ file Overpass/Wikidata đã tải về, `enrich_images.py batch` rồi `import_places.py` nạp vào Mongo, `enrich_images.py search` bổ sung ảnh chậm (có thể dừng và chạy lại), `verify_places.py` kiểm tra trùng. Wikimedia giới hạn tốc độ nên đừng chạy song song. Script nạp polygon tỉnh/xã không nằm trong repo. Service không đọc DB của service khác, cần dữ liệu thì gọi qua API.

## Auth và role

- Role: `USER`, `ADMIN` (enum `Role`). Đăng ký công khai luôn tạo `USER`.
- Admin được seed khi auth-service khởi động: `admin@vibecode.com` (mật khẩu và các giá trị khác cấu hình ở `app.admin.*`, không commit lên git).
- JWT HS256, secret ở `app.jwt.secret` (Base64, chỉ dùng cho dev, đổi khi lên môi trường thật). Role nằm trong claim `role`.
- Endpoint: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me` (sửa họ tên, số điện thoại), `PUT /api/auth/password` (đổi mật khẩu, cần mật khẩu hiện tại), `GET /api/admin/users` (chỉ ADMIN), `POST /api/admin/users/{id}/reset-password` (chỉ ADMIN, sinh mật khẩu tạm trả về một lần). Chưa có "quên mật khẩu" qua email vì chưa có SMTP.
- FE: `/profile` (hồ sơ, đổi mật khẩu); nút đặt lại mật khẩu ở `/dashboard/users`.
- business-service đọc JWT của auth-service qua `app.jwt.secret` (đặt trong `BE/business-service/application-local.yml` hoặc biến môi trường `JWT_SECRET`, phải trùng secret của auth-service, không commit). Hiện chỉ API tour/đăng ký/đánh giá kiểm tra JWT, các API cũ của business-service vẫn chưa xác thực.

## Phân quyền và khu vực người dùng

- **Khu quản trị `/dashboard/*` và `/main-dashboard` chỉ dành cho ADMIN**: người dùng thường vào sẽ bị chuyển về `/`. Sau đăng nhập: ADMIN vào `/dashboard`, USER về `/` (hoặc trang đang xem trước đó, lưu qua `lib/loginRedirect.ts`).
- **BE kiểm tra ADMIN cho mọi thao tác ghi** (POST/PUT/DELETE) của landmarks, destinations, holidays, menus, tours và `GET /stats/dashboard`, bằng `JwtAuth.requireAdmin`. Các GET công khai (landmarks, destinations, tours, đánh giá, overview...) khách xem được không cần token. `file-service` vẫn chưa xác thực.
- **Khu vực người dùng (khách xem được, chỉ không thêm/sửa/xóa)**, dùng bộ giao diện riêng ở `FE/src/components/site/` (token màu/phông ở `tokens.ts`, `SiteShell`, `PageHero`, `FavoriteButton`): `/` (landing), `/explore` + `/explore/landmarks/[id]` + `/explore/destinations/[id]`, `/tours`, `/tours/[id]`, `/map`, `/blog`, `/blog/[slug]` (nội dung ở `lib/blogPosts.ts`), `/about`. Cần đăng nhập: đăng ký tour, yêu thích, `/my-tours`, `/favorites`, `/profile`.
- Trang game `/game` (công khai): trò **dò mìn** ở `components/game/Minesweeper.tsx`, logic thuần ở `lib/minesweeper.ts` (kiểm thử bằng `script/minesweeper_test.sh`); 3 độ khó, ô bấm đầu tiên luôn an toàn, kỷ lục lưu ở localStorage. Có link "Game" ở header và footer.
- Phông chữ có chân dùng Palatino Linotype, **không dùng Georgia** vì thiếu dấu chồng tiếng Việt.
- **Yêu thích** (`favorites`): `GET /api/business/favorites` (danh sách), `GET /favorites/keys`, `PUT|DELETE /favorites/{TOUR|DESTINATION|LANDMARK}/{id}`; cần đăng nhập, mỗi người một bản ghi cho mỗi mục.
- Bản đồ dùng chung qua `components/MapExplorer.tsx` (admin `/dashboard/map` và khách `/map`). Marker là ghim SVG, chỉ vẽ các điểm trong khung nhìn và thưa bớt khi thu nhỏ (dưới zoom 12); chọn tỉnh chỉ vẽ viền tỉnh, ranh giới phường chỉ hiện khi chọn phường trong ô tìm kiếm (bấm vào phường trên bản đồ không làm gì). `GET /api/business/overview` trả số liệu tổng quan công khai cho trang Giới thiệu. Danh sách destinations hỗ trợ lọc `q, provinceCode, type, hasImage, offset, limit`; landmarks hỗ trợ thêm `hasImage`; tours hỗ trợ `upcoming, placeId, limit`.

## Tour

- business-service: `tours` (liên kết `landmarkIds`, `destinationIds`), `tour_bookings`, `tour_reviews`. `GET /api/business/tours` và `/{id}` công khai, thêm/sửa/xóa cần ADMIN. Người dùng đăng ký bằng `POST /tours/{id}/bookings` (cần đăng nhập, mỗi người một đăng ký còn hiệu lực cho mỗi tour, giới hạn `maxParticipants`). Thanh toán tiền mặt sau khi hành trình kết thúc: ADMIN gọi `POST /bookings/{id}/complete` (chỉ khi `endDate` đã qua) để chuyển sang COMPLETED + PAID. Chỉ người đã COMPLETED mới đánh giá được (`POST /tours/{id}/reviews`, đánh giá lại thì cập nhật). Người dùng hủy qua `POST /bookings/{id}/cancel` khi tour chưa khởi hành.
- FE người dùng: `/tours`, `/tours/[id]` (đăng ký, đánh giá), `/my-tours`. FE quản trị: `/dashboard/tours` (CRUD, chọn địa điểm liên kết), `/dashboard/bookings`.
- Danh sách mọi màn hình quản lý trả bản ghi mới nhất lên đầu (sắp xếp theo `_id` giảm dần); sidebar vẫn theo `order` của menu.
- Menu sidebar lấy từ collection `menus` (`/dashboard/menus` để thêm/sửa/xóa/ẩn hiện). Menu có hai cấp: **nhóm** (không có `href`) chứa các **menu con** qua `parentId`; nhóm không được nằm trong nhóm khác, nhóm đang có menu con không xóa được, ẩn nhóm thì ẩn cả menu con. Hiện có nhóm "Du lịch" gồm Bản đồ, Ngày lễ, Di tích thắng cảnh, Địa điểm du lịch, Tour, Đăng ký tour. `MenuSeeder` chỉ nạp mặc định khi collection trống, menu mới cho DB đang chạy thêm bằng script trong `script/`.
- CORS cho phép các origin ở `app.cors.allowed-origin` (phân tách bằng dấu phẩy), hiện là `http://localhost:3000` và `http://localhost:3001`.

## Chạy dự án

1. Bật MongoDB local (`localhost:27017`).
2. BE: `cd BE && mvn spring-boot:run -pl auth-service` (đổi `-pl` để chạy service khác).
3. FE: `cd FE && npm install && npm run dev`, mở http://localhost:3000.
4. Recommend (tùy chọn): `cd BE/recommend-service && python -m venv .venv && .venv/Scripts/python -m pip install -r requirements.txt`, tạo `.env` từ `.env.example`, rồi `.venv/Scripts/python -m uvicorn app.main:app --port 8084`. Kiểm thử: `pip install -r requirements-dev.txt && python -m pytest`. Cần business-service và auth-service chạy trước, nếu không service báo "đang khởi tạo" (503) cho tới khi lấy được dữ liệu. Nếu httpx báo lỗi SSL do biến `SSL_CERT_FILE` trỏ sai, code đã tự dùng kho chứng chỉ của `certifi`.

Nếu Maven báo lỗi SSL `PKIX path building failed`, chạy với `MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"` để Java dùng kho chứng chỉ của Windows.

## Quy ước

- Thông báo hiển thị cho người dùng viết bằng tiếng Việt (cả FE và message lỗi từ BE).
- Lỗi BE trả về dạng `{"message": "..."}`, FE đọc field `message`.
- Thêm service mới: tạo module trong `BE/`, khai báo vào `<modules>` của `BE/pom.xml`, cấp cổng và database riêng.
- Khi tạo file nhiều dòng có tiếng Việt bằng bash heredoc có lúc bị lỗi cú pháp, ưu tiên dùng công cụ Write.


# rule push code
- Không được push code liên quan đến key, giá trị mà bảo mật lên github, ví dụ: NEXT_PUBLIC_AUTH_API=http://localhost:8081 thì chỉ dc push "NEXT_PUBLIC_AUTH_API ="  lên thôi, giá trị phía sau dấu = không dc push.
- Các file liên quan đến nạp dữ liệu vào mongo/superset,... và craw thì bỏ vào folder /script và cho vào gitignore không dc push code lên.