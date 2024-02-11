import { Link, NavLink } from "@remix-run/react";
import { useRef } from "react";
import { Collapse } from "~/utils/bootstrap.client";

const onItemClick = (nav: HTMLElement | null) => {
  if (nav !== null) {
    Collapse.getInstance(nav)?.hide();
  }
};

export default function Navbar() {
  const collapseRef = useRef<HTMLDivElement>(null);

  return (
    <nav
      className="navbar navbar-expand-sm bg-dark fixed-top"
      data-bs-theme="dark"
    >
      <div className="container">
        <Link to="/" className="navbar-brand">
          Heineken
        </Link>

        <button
          type="button"
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div id="navbar" className="collapse navbar-collapse" ref={collapseRef}>
          <div className="navbar-nav">
            <NavLink
              to="/search/pukiwiki"
              className="nav-item nav-link"
              onClick={() => onItemClick(collapseRef.current)}
            >
              PukiWiki
            </NavLink>
            <NavLink
              to="/search/scrapbox"
              className="nav-item nav-link"
              onClick={() => onItemClick(collapseRef.current)}
            >
              Scrapbox
            </NavLink>
            <NavLink
              to="/search/mail"
              className="nav-item nav-link"
              onClick={() => onItemClick(collapseRef.current)}
            >
              Mail
            </NavLink>
            <NavLink
              to="/help"
              className="nav-item nav-link"
              onClick={() => onItemClick(collapseRef.current)}
            >
              Help
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
