import axios from "axios";

export const TOKEN_KEY = "vibecode_token";

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

function createClient(baseURL: string) {
  const client = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });

  // Tự gắn token vào mọi request nếu đã đăng nhập.
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Chuẩn hóa lỗi: luôn ném Error có message tiếng Việt từ BE (field `message`).
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const message = error.response?.data?.message ?? (error.response ? "Đã có lỗi xảy ra" : "Không kết nối được máy chủ");
      return Promise.reject(Object.assign(new Error(message), { status: error.response?.status }));
    }
  );
  return client;
}

const http = createClient(process.env.NEXT_PUBLIC_AUTH_API ?? "");
const businessHttp = createClient(process.env.NEXT_PUBLIC_BUSINESS_API ?? "");
const fileHttp = createClient(process.env.NEXT_PUBLIC_FILE_API ?? "");
const recommendHttp = createClient(process.env.NEXT_PUBLIC_RECOMMEND_API ?? "");

export const authApi = {
  login: (email: string, password: string) =>
    http.post<AuthResponse>("/api/auth/login", { email, password }).then((r) => r.data),
  register: (fullName: string, email: string, password: string) =>
    http.post<AuthResponse>("/api/auth/register", { fullName, email, password }).then((r) => r.data),
  me: () => http.get<User>("/api/auth/me").then((r) => r.data),
  listUsers: () => http.get<User[]>("/api/admin/users").then((r) => r.data),
  updateProfile: (fullName: string, phone: string) => http.put<User>("/api/auth/me", { fullName, phone }).then((r) => r.data),
  changePassword: (currentPassword: string, newPassword: string) => http.put("/api/auth/password", { currentPassword, newPassword }).then(() => undefined),
  /** Admin đặt lại mật khẩu, trả về mật khẩu tạm (chỉ hiện một lần). */
  resetUserPassword: (id: string) => http.post<{ temporaryPassword: string }>(`/api/admin/users/${id}/reset-password`).then((r) => r.data),
};

// ---- business-service ----

export interface GeoJsonGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
}

export interface Province {
  id: string;
  code: number;
  name: string;
  divisionType: string;
  bbox?: [number, number, number, number];
  geometry?: GeoJsonGeometry;
}

export interface Ward {
  id: string;
  code: number;
  name: string;
  divisionType: string;
  provinceCode: number;
  bbox?: [number, number, number, number];
  center?: [number, number];
  geometry?: GeoJsonGeometry;
}

export type HolidayCalendar = "SOLAR" | "LUNAR";
export type HolidayCategory = "PUBLIC" | "TRADITIONAL" | "INTERNATIONAL";

export interface Holiday {
  id: string;
  name: string;
  calendar: HolidayCalendar;
  day: number;
  month: number;
  category: HolidayCategory;
  dayOff: boolean;
  description?: string;
}

export type LandmarkStatus = "ACTIVE" | "PAUSED" | "DELETED";

export interface Landmark {
  id: string;
  name: string;
  category: string;
  provinceCode: number;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  recognitionLevel?: string;
  recognitionYear?: number | null;
  areaKm2?: number | null;
  status: LandmarkStatus;
  description: string;
  detail?: string;
  highlights?: string[];
  images?: string[];
  urlImage?: string;
  source?: string;
  sourceId?: string;
}

export interface Destination {
  id: string;
  name: string;
  type: string;
  provinceCode: number;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  bestSeason?: string;
  description?: string;
  urlImage?: string;
  source?: string;
  sourceId?: string;
}

function crud<T extends { id: string }>(path: string) {
  return {
    list: (params?: Record<string, unknown>) => businessHttp.get<T[]>(path, { params }).then((r) => r.data),
    get: (id: string) => businessHttp.get<T>(`${path}/${id}`).then((r) => r.data),
    create: (body: Omit<T, "id">) => businessHttp.post<T>(path, body).then((r) => r.data),
    update: (id: string, body: Omit<T, "id">) => businessHttp.put<T>(`${path}/${id}`, body).then((r) => r.data),
    remove: (id: string) => businessHttp.delete(`${path}/${id}`).then(() => undefined),
  };
}

export const geoApi = {
  provinces: (geometry = false) =>
    businessHttp.get<Province[]>("/api/business/provinces", { params: { geometry } }).then((r) => r.data),
  wards: (provinceCode: number, geometry = false) =>
    businessHttp.get<Ward[]>("/api/business/wards", { params: { provinceCode, geometry } }).then((r) => r.data),
};

export const holidayApi = crud<Holiday>("/api/business/holidays");
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface LandmarkFilter {
  q?: string;
  provinceCode?: number;
  status?: LandmarkStatus;
  category?: string;
  level?: string;
  /** Chỉ lấy bản ghi có ảnh. */
  hasImage?: boolean;
  page: number;
  size: number;
}

export interface LandmarkStats {
  total: number;
  active: number;
  paused: number;
  deleted: number;
}

export type LandmarkMarker = Pick<Landmark, "id" | "name" | "category" | "address" | "latitude" | "longitude">;

export const landmarkApi = {
  ...crud<Landmark>("/api/business/landmarks"),
  // list trả về một trang theo bộ lọc, khác với các CRUD khác.
  list: (filter: LandmarkFilter) => businessHttp.get<PageResult<Landmark>>("/api/business/landmarks", { params: filter }).then((r) => r.data),
  stats: () => businessHttp.get<LandmarkStats>("/api/business/landmarks/stats").then((r) => r.data),
  markers: () => businessHttp.get<LandmarkMarker[]>("/api/business/landmarks/markers").then((r) => r.data),
};
export const destinationApi = crud<Destination>("/api/business/destinations");

// ---- Xe hơi ----

export interface Car {
  id: string;
  name: string;
  brand: string;
  model?: string;
  bodyType?: string;
  country?: string;
  year?: number | null;
  fuel?: string;
  transmission?: string;
  seats?: number | null;
  /** Giá (đồng). Là ước tính theo phân khúc khi priceEstimated = true. */
  price?: number | null;
  priceEstimated?: boolean;
  featured?: boolean;
  description?: string;
  urlImage?: string;
  source?: string;
  sourceId?: string;
}

export interface CarFilter {
  q?: string;
  brand?: string;
  bodyType?: string;
  fuel?: string;
  minPrice?: number;
  maxPrice?: number;
  hasImage?: boolean;
  featured?: boolean;
  page?: number;
  size?: number;
}

export interface CarStats {
  total: number;
  brands: number;
  bodyTypes: string[];
  fuels: string[];
}

export const carApi = {
  ...crud<Car>("/api/business/cars"),
  /** Toàn bộ mẫu xe cho bảng quản trị (lọc phía client). */
  list: () => businessHttp.get<Car[]>("/api/business/cars/all").then((r) => r.data),
  /** Một trang theo bộ lọc, cho khu vực người dùng. */
  page: (filter: CarFilter) => businessHttp.get<PageResult<Car>>("/api/business/cars", { params: filter }).then((r) => r.data),
  stats: () => businessHttp.get<CarStats>("/api/business/cars/stats").then((r) => r.data),
};

export interface CarBrand {
  id: string;
  name: string;
  country?: string;
  description?: string;
  urlImage?: string;
  carCount: number;
}
export const carBrandApi = {
  ...crud<CarBrand>("/api/business/car-brands"),
  top: (limit: number) => businessHttp.get<CarBrand[]>("/api/business/car-brands", { params: { limit } }).then((r) => r.data),
};

export type TestDriveStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export interface TestDrive {
  id: string;
  carId: string;
  carName: string;
  userEmail: string;
  fullName: string;
  phone: string;
  preferredDate: string;
  note?: string;
  status: TestDriveStatus;
  createdAt: string;
}
export interface TestDriveInput {
  carId: string;
  fullName: string;
  phone: string;
  preferredDate: string;
  note?: string;
}
export const testDriveApi = {
  book: (body: TestDriveInput) => businessHttp.post<TestDrive>("/api/business/test-drives", body).then((r) => r.data),
  mine: () => businessHttp.get<TestDrive[]>("/api/business/test-drives/mine").then((r) => r.data),
  cancel: (id: string) => businessHttp.post<TestDrive>(`/api/business/test-drives/${id}/cancel`).then((r) => r.data),
  /** Admin. */
  list: (status?: string) => businessHttp.get<TestDrive[]>("/api/business/test-drives", { params: { status } }).then((r) => r.data),
  setStatus: (id: string, status: TestDriveStatus) => businessHttp.put<TestDrive>(`/api/business/test-drives/${id}/status`, { status }).then((r) => r.data),
};

/** Một mục menu của sidebar; icon là khóa trong ICONS (lib/navigation.tsx). */
export interface MenuConfig {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
  visible: boolean;
  adminOnly: boolean;
  /** Id của nhóm menu chứa menu này; không có thì là menu gốc. Nhóm menu không có href. */
  parentId?: string | null;
}
export const menuApi = crud<MenuConfig>("/api/business/menus");

// ---- Tour ----

export type TourStatus = "OPEN" | "CLOSED" | "CANCELLED";

export interface PlaceRef {
  id: string;
  name: string;
  address?: string;
  image?: string;
}

export interface Tour {
  id: string;
  name: string;
  summary?: string;
  itinerary?: string;
  image?: string;
  price: number;
  durationDays: number;
  /** Ngày dạng yyyy-MM-dd. */
  startDate: string;
  endDate: string;
  maxParticipants: number;
  status: TourStatus;
  landmarkIds: string[];
  destinationIds: string[];
  landmarks: PlaceRef[];
  destinations: PlaceRef[];
  avgRating: number;
  reviewCount: number;
  bookedSeats: number;
  createdAt?: string;
}

/** Các trường admin nhập khi thêm/sửa tour. */
export type TourInput = Pick<Tour, "name" | "summary" | "itinerary" | "image" | "price" | "durationDays" | "startDate" | "endDate" | "maxParticipants" | "status" | "landmarkIds" | "destinationIds">;

export type BookingStatus = "REGISTERED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PAID";

export interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  tourImage?: string;
  startDate?: string;
  endDate?: string;
  tourStatus?: TourStatus;
  userEmail: string;
  contactName: string;
  phone: string;
  participants: number;
  totalAmount: number;
  note?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  hasReview: boolean;
}

export interface BookingInput {
  contactName: string;
  phone: string;
  participants: number;
  note?: string;
}

export interface TourReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  mine: boolean;
}

export const tourApi = {
  ...crud<Tour>("/api/business/tours"),
  save: (input: TourInput, id?: string) =>
    (id ? businessHttp.put<Tour>(`/api/business/tours/${id}`, input) : businessHttp.post<Tour>("/api/business/tours", input)).then((r) => r.data),
  reviews: (id: string) => businessHttp.get<TourReview[]>(`/api/business/tours/${id}/reviews`).then((r) => r.data),
  review: (id: string, body: { rating: number; comment: string }) => businessHttp.post<TourReview>(`/api/business/tours/${id}/reviews`, body).then((r) => r.data),
  book: (id: string, body: BookingInput) => businessHttp.post<Booking>(`/api/business/tours/${id}/bookings`, body).then((r) => r.data),
};

export const bookingApi = {
  mine: () => businessHttp.get<Booking[]>("/api/business/bookings/mine").then((r) => r.data),
  cancel: (id: string) => businessHttp.post<Booking>(`/api/business/bookings/${id}/cancel`).then((r) => r.data),
  /** Admin: danh sách đăng ký, lọc theo tour hoặc trạng thái. */
  list: (params?: { tourId?: string; status?: string }) => businessHttp.get<Booking[]>("/api/business/bookings", { params }).then((r) => r.data),
  /** Admin: xác nhận đã hoàn thành chuyến đi và thu tiền mặt. */
  complete: (id: string) => businessHttp.post<Booking>(`/api/business/bookings/${id}/complete`).then((r) => r.data),
};

/** Số liệu thống kê (lấy từ Superset qua business-service). kpi chỉ có một giá trị. */
export interface StatsChart {
  id: number;
  name: string;
  type: "kpi" | "pie" | "bar";
  horizontal: boolean;
  labels: string[];
  values: number[];
}

export interface StatsTab {
  title: string;
  charts: StatsChart[];
}

export interface StatsDashboard {
  title: string;
  updatedAt: number;
  tabs: StatsTab[];
}

export const statsApi = {
  dashboard: () => businessHttp.get<StatsDashboard>("/api/business/stats/dashboard").then((r) => r.data),
};

export interface UploadedFile {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  bytes: number;
  originalName: string;
}

export const fileApi = {
  /** Tải file (ảnh, video, tài liệu) lên Cloudinary qua file-service, trả về thông tin file kèm URL công khai. */
  upload: (file: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file);
    return fileHttp
      .post<UploadedFile>("/api/files", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
      .then((r) => r.data);
  },
  uploadImage: (file: File) => fileApi.upload(file).then((r) => r.url),
};

// ---- Yêu thích (người dùng) ----

export type FavoriteType = "TOUR" | "DESTINATION" | "LANDMARK";

export interface FavoriteItem {
  type: FavoriteType;
  targetId: string;
  name: string;
  image?: string;
  /** Tour: số ngày; địa điểm và di tích: địa chỉ. */
  subtitle?: string;
  /** Chỉ có với tour. */
  price?: number;
  createdAt: string;
}

export const favoriteApi = {
  list: () => businessHttp.get<FavoriteItem[]>("/api/business/favorites").then((r) => r.data),
  keys: () => businessHttp.get<string[]>("/api/business/favorites/keys").then((r) => r.data),
  add: (type: FavoriteType, id: string) => businessHttp.put(`/api/business/favorites/${type}/${id}`).then(() => undefined),
  remove: (type: FavoriteType, id: string) => businessHttp.delete(`/api/business/favorites/${type}/${id}`).then(() => undefined),
};

/** Số liệu tổng quan công khai (số di tích, địa điểm, tour...). */
export const overviewApi = {
  get: () => businessHttp.get<Record<"landmarks" | "destinations" | "provinces" | "tours" | "reviews", number>>("/api/business/overview").then((r) => r.data),
};

// ---- recommend-service ----

export interface RecommendedTour {
  tourId: string;
  name: string;
  image?: string | null;
  price: number;
  durationDays: number;
  startDate?: string | null;
  avgRating: number;
  reviewCount: number;
  score: number;
  /** Lý do gợi ý, hiển thị cho người dùng (vd "Cùng điểm đến"). */
  reasons: string[];
}

export interface NearbyPlace {
  id: string;
  kind: "destination" | "landmark";
  name: string;
  address?: string | null;
  image?: string | null;
  distanceKm: number;
}

export type RecommendEventType = "VIEW_TOUR" | "FAVORITE_TOUR" | "VIEW_PLACE" | "SEARCH" | "RECOMMEND_VIEW" | "RECOMMEND_CLICK";

export interface RecommendEvent {
  type: RecommendEventType;
  targetId?: string;
  query?: string;
  /** Khối gợi ý phát sinh sự kiện: similar | for_me | popular | nearby. */
  source?: string;
  sessionId?: string;
}

export interface RecommendStatus {
  ready: boolean;
  /** Thời điểm dựng mô hình gần nhất (giây epoch). */
  builtAt?: number | null;
  tours: number;
  places: number;
  usersWithHistory: number;
  eventsEnabled: boolean;
}

export interface RecommendMetrics {
  days: number;
  byType: Record<string, number>;
  recommendSources: { source: string; views: number; clicks: number; clickRate: number }[];
}

export const recommendApi = {
  /** Trạng thái mô hình gợi ý (công khai). */
  status: () => recommendHttp.get<RecommendStatus>("/api/recommend/status").then((r) => r.data),
  /** Admin: dựng lại mô hình ngay từ dữ liệu mới nhất. */
  refresh: () => recommendHttp.post<RecommendStatus>("/api/recommend/refresh").then((r) => r.data),
  /** Admin: số sự kiện và tỷ lệ bấm theo khối gợi ý. */
  metrics: (days = 30) => recommendHttp.get<RecommendMetrics>("/api/recommend/metrics", { params: { days } }).then((r) => r.data),
  popular: (limit = 6) => recommendHttp.get<RecommendedTour[]>("/api/recommend/tours/popular", { params: { limit } }).then((r) => r.data),
  similar: (tourId: string, limit = 4) => recommendHttp.get<RecommendedTour[]>(`/api/recommend/tours/${tourId}/similar`, { params: { limit } }).then((r) => r.data),
  /** Cần đăng nhập. */
  forMe: (limit = 6) => recommendHttp.get<RecommendedTour[]>("/api/recommend/me", { params: { limit } }).then((r) => r.data),
  nearby: (placeId: string, limit = 6, radiusKm = 50) => recommendHttp.get<NearbyPlace[]>(`/api/recommend/places/${placeId}/nearby`, { params: { limit, radius_km: radiusKm } }).then((r) => r.data),
  track: (event: RecommendEvent) => recommendHttp.post("/api/recommend/events", event).then(() => undefined),
};
