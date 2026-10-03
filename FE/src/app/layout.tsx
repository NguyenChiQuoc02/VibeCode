import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "VibeCode",
  description: "VibeCode",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
