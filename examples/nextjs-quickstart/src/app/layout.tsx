import { BlerpProvider } from "@blerp/nextjs";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlerpProvider publishableKey="pk_test_123">
      <html lang="en">
        <body>{children}</body>
      </html>
    </BlerpProvider>
  );
}
