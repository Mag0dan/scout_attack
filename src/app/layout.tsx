import "antd/dist/reset.css"; // для antd v5+ (если v4 — 'antd/dist/antd.css')
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import { App } from "antd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WYS - Security Dashboard",
  description: "Vulnerability scanning and security monitoring dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <App>
          <LayoutWrapper>{children}</LayoutWrapper>
        </App>
      </body>
    </html>
  );
}
