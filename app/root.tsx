import styles from "./root.css";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "bootstrap/dist/css/bootstrap.min.css";

export const meta: MetaFunction = () => {
  return [{ title: "Heineken" }];
};

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/favicon.png",
    type: "image/png",
  },
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

function Navbar() {
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
              Pukiwiki
            </NavLink>
            <NavLink to="/search/mail" className="nav-item nav-link">
              Mail
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

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="container">
          <Navbar />
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
