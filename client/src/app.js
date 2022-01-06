import Container from "react-bootstrap/Container";
import { Link, Outlet } from "react-router-dom";

import "./app.scss";

export const App = () => {
  return (
    <div>
      <nav>
        <Link to="/add-recipe">Add recipe</Link>
        {" | "}
        <Link to="/recipes">Recipes</Link>
      </nav>
      <Container>
        <h1>Rezept-DB</h1>
        <Outlet />
      </Container>
    </div>
  );
};
