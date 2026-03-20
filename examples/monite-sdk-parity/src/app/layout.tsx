import { BlerpProvider } from "@blerp/nextjs";
import { OrganizationSwitcher } from "@blerp/nextjs";
import React from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlerpProvider>
      <html lang="en">
        <body>
          <header className="p-4 border-b flex justify-between items-center">
            <span className="font-bold">Blerp + Monite SDK</span>
            <OrganizationSwitcher />
          </header>
          {children}
        </body>
      </html>
    </BlerpProvider>
  );
}
