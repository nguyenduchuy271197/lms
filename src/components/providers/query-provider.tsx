"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ToastProvider from "./toast-provider";

const queryClient = new QueryClient();

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};
