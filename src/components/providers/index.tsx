"use client";

import { QueryProvider } from "./query-provider";
import ToastProvider from "./toast-provider";
import { MobileSidebarProvider } from "./mobile-sidebar-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <MobileSidebarProvider>{children}</MobileSidebarProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
