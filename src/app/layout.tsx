import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sentry Buggy App",
  description: "A deliberately buggy Next.js app for testing sentry-agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <nav style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/users">Users</a>
          <a href="/orders">Orders</a>
          <a href="/analytics">Analytics</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
