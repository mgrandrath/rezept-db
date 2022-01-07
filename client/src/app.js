import { Outlet } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { useToast } from "./toast.js";
import { AppHeader } from "./components/screen.js";

import "./app.scss";

export const App = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div>
      <AppHeader />
      <div className="app__toast-wrapper position-relative">
        <ToastContainer position="top-end" className="p-3">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              onClose={() => removeToast(toast.id)}
              autohide
              delay={3000}
            >
              <Toast.Header>
                <span className="me-auto">{toast.heading}</span>
              </Toast.Header>
              <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      </div>
      <Container className="mt-5">
        <Outlet />
      </Container>
    </div>
  );
};
