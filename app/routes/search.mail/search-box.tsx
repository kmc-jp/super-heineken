import styles from "./search-box.css";
import {
  faCircleQuestion,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinksFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { useEffect, useState } from "react";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface SearchBoxProps {
  order: string;
  defaultAdvanced: boolean;
  defaultQuery: string;
}

export function SearchBox(props: SearchBoxProps) {
  const [advanced, setAdvanced] = useState(props.defaultAdvanced);
  const [query, setQuery] = useState(props.defaultQuery);

  useEffect(() => setQuery(props.defaultQuery), [props.defaultQuery]);
  useEffect(() => setAdvanced(props.defaultAdvanced), [props.defaultAdvanced]);

  return (
    <div className="SearchBox row">
      <div className="col-md-8 offset-md-2 mt-4 mt-sm-5 mb-4">
        <Form action="/search/mail" preventScrollReset>
          <div className="input-group input-group-lg">
            <input
              className="form-control"
              autoFocus={true}
              type="text"
              name="query"
              placeholder={advanced ? "Input raw query string..." : "Search"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input type="hidden" name="order" value={props.order} />
            <button className="btn btn-outline-secondary" type="submit">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
          <div className="form-switch form-check ms-1 mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              name="advanced"
              id="searchBoxCheckBox"
              checked={advanced}
              onChange={(e) => setAdvanced(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="searchBoxCheckBox">
              Advanced mode&ensp;
              <Link to="/help" id="questionMarkLink" target="_blank">
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  id="questionMark"
                  size="sm"
                />
              </Link>
            </label>
          </div>
        </Form>
      </div>
    </div>
  );
}
