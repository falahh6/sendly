"use client";

import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: Readonly<{ children: Readonly<React.ReactNode> }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
