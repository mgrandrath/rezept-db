import { Nav } from "react-bootstrap";
import { Link, useLocation, useResolvedPath } from "react-router-dom";

const NavLink = (props) => {
  const { to, end, ...linkProps } = props;

  const currentLocation = useLocation();
  const currentPathname = currentLocation.pathname;
  const destinationPath = useResolvedPath(to);
  const destinationPathname = destinationPath.pathname;

  const isActive =
    currentPathname === destinationPathname ||
    (!end &&
      currentPathname.startsWith(destinationPathname) &&
      currentPathname.charAt(destinationPathname.length) === "/");

  return <Nav.Link {...linkProps} active={isActive} as={Link} to={to} />;
};

export const AppHeader = () => {
  return (
    <header>
      <Nav variant="pills">
        <Nav.Item>
          <NavLink to="/recipes">Find recipe</NavLink>
        </Nav.Item>
        <Nav.Item>
          <NavLink to="/add-recipe">Add recipe</NavLink>
        </Nav.Item>
      </Nav>
    </header>
  );
};
