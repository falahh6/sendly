"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

export function Providers({
  children,
}: Readonly<{ children: Readonly<React.ReactNode> }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
