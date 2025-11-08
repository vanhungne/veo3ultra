// app/admin/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - License Management",
  description: "Admin dashboard for license management system",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

