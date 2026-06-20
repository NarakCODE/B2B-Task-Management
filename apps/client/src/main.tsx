import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react";

import "./index.css";
import App from "./App.tsx";
import QueryProvider from "./context/query-provider.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryProvider>
        <NuqsAdapter>
          <App />
        </NuqsAdapter>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
);
