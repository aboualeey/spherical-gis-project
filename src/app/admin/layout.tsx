// admin/services/layout.tsx
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="admin-container">
          <header>Admin Dashboard</header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}