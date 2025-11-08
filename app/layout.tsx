import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NVH",
  description: "Secure license management with auto-trial and admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        margin: 0,
        padding: 0,
        minHeight: '100vh'
      }}>
        <div className="space-background"></div>
        {children}
      </body>
    </html>
  );
}

