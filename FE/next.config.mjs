/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Chỉ nạp phần dùng tới của thư viện lớn, giảm kích thước bundle và thời gian biên dịch.
  experimental: { optimizePackageImports: ["@mui/material", "@mui/icons-material", "@tanstack/react-query"] },
};

export default nextConfig;
