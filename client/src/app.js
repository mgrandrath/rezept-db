import Container from "react-bootstrap/Container";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/screen.js";

import "./app.scss";

export const App = () => {
  return (
    <div>
      <AppHeader />
      <Container className="mt-5">
        <Outlet />
      </Container>
    </div>
  );
};
