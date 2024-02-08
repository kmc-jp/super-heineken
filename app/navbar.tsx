import { Link, NavLink } from "@remix-run/react";

export default function Navbar() {
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

        <div id="navbar" className="collapse navbar-collapse">
          <div className="navbar-nav">
            <NavLink to="/search/pukiwiki" className="nav-item nav-link">
              PukiWiki
            </NavLink>
            <NavLink to="/search/mail" className="nav-item nav-link">
              Mail
            </NavLink>
            <NavLink to="/search/scrapbox" className="nav-item nav-link">
              ScrapBox
            </NavLink>
            <NavLink to="/help" className="nav-item nav-link">
              Help
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
