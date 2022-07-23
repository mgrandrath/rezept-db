import {
  Nav,
  Navbar,
  type NavLinkProps as BsNavLinkProps,
} from "react-bootstrap";
import { Link, useLocation, useResolvedPath, type To } from "react-router-dom";
import {
  Search as FindIcon,
  PlusCircle as AddIcon,
} from "bootstrap-icons-react";
import { addRecipeRoute, recipesRoute } from "../routes";

interface NavLinkProps extends BsNavLinkProps {
  to: To;
  end?: boolean;
}

const NavLink = (props: NavLinkProps) => {
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
    <Navbar bg="dark" variant="dark" className="px-4">
      <Navbar.Brand>
        <Link to="/" className="text-reset text-decoration-none">
          Rezept-DB
        </Link>
      </Navbar.Brand>
      <Nav className="ms-auto">
        <Nav.Item className="ms-4">
          <NavLink to={recipesRoute.url({})}>
            <FindIcon className="d-block mx-auto mb-1" width={18} height={18} />
            Find recipe
          </NavLink>
        </Nav.Item>
        <Nav.Item className="ms-4">
          <NavLink to={addRecipeRoute.url({})}>
            <AddIcon className="d-block mx-auto mb-1" width={18} height={18} />
            Add recipe
          </NavLink>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
};
