import styles from "./index.css";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinksFunction } from "@remix-run/node";

interface HeinekenErrorProps {
  error: string;
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function HeinekenError(props: HeinekenErrorProps) {
  return (
    <div className="HeinekenError">
      <div className="alert alert-danger col-sm-10 offset-1" role="alert">
        <FontAwesomeIcon icon={faTriangleExclamation} />
        &ensp;{props.error}
      </div>
    </div>
  );
}
