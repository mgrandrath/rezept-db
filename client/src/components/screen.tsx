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
import classNames from "classnames";

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

  const className = classNames([
    "ms-4",
    "py-1",
    { "text-bg-primary": isActive },
  ]);

  return (
    <Nav.Item className={className}>
      <Nav.Link {...linkProps} active={isActive} as={Link} to={to} />
    </Nav.Item>
  );
};

export const AppHeader = () => {
  return (
    <Navbar bg="dark" variant="dark" className="px-4 py-0">
      <Navbar.Brand>
        <Link to="/" className="text-reset text-decoration-none">
          Rezept-DB
        </Link>
      </Navbar.Brand>
      <Nav className="ms-auto">
        <NavLink to={recipesRoute.url({})}>
          <FindIcon className="d-block mx-auto mb-1" width={18} height={18} />
          Find recipe
        </NavLink>
        <NavLink to={addRecipeRoute.url({})}>
          <AddIcon className="d-block mx-auto mb-1" width={18} height={18} />
          Add recipe
        </NavLink>
      </Nav>
    </Navbar>
  );
};
