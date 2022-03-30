import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "./router.js";
import { ToastContextProvider } from "./toast.js";

const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastContextProvider>
        <Router />
      </ToastContextProvider>
    </QueryClientProvider>
  </StrictMode>
);
