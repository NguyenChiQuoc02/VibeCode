import axios from "axios";

export const TOKEN_KEY = "vibecode_token";

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
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

export const authApi = {
  login: (email: string, password: string) =>
    http.post<AuthResponse>("/api/auth/login", { email, password }).then((r) => r.data),
  register: (fullName: string, email: string, password: string) =>
    http.post<AuthResponse>("/api/auth/register", { fullName, email, password }).then((r) => r.data),
  me: () => http.get<User>("/api/auth/me").then((r) => r.data),
  listUsers: () => http.get<User[]>("/api/admin/users").then((r) => r.data),
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
  latitude: number;
  longitude: number;
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
  latitude: number;
  longitude: number;
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
