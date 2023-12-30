import HeinekenError from "./components/heineken-error";
import Navbar from "./navbar";
import styles from "./root.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
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

export function ErrorBoundary() {
  const err = useRouteError();
  console.error(err);
  const msg = isRouteErrorResponse(err)
    ? err.data
    : err instanceof Error
      ? err.message
      : String(err);
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="container">
          <Navbar />
          <div className="row mt-4">
            <HeinekenError error={msg} />
          </div>
        </div>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function Root() {
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
