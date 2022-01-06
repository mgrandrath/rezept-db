import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import { Search, PlusCircle } from "bootstrap-icons-react";

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
    <Navbar bg="dark" variant="dark" className="px-5 py-3">
      <Navbar.Brand>Rezept-DB</Navbar.Brand>
      <Nav className="ms-auto">
        <Nav.Item className="ms-4">
          <NavLink to="/recipes">
            <Search className="d-block mx-auto mb-1" width={24} height={24} />
            Find recipe
          </NavLink>
        </Nav.Item>
        <Nav.Item className="ms-4">
          <NavLink to="/add-recipe">
            <PlusCircle
              className="d-block mx-auto mb-1"
              width={24}
              height={24}
            />
            Add recipe
          </NavLink>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
};
