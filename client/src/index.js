import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "./router.js";
import { ToastContextProvider } from "./toast.js";

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastContextProvider>
        <Router />
      </ToastContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
