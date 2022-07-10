import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "./router";
import { ToastContextProvider } from "./toast";

const queryClient = new QueryClient();
const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastContextProvider>
        <Router />
      </ToastContextProvider>
    </QueryClientProvider>
  </StrictMode>
);
