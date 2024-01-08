import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface HeinekenErrorProps {
  error: string;
}

export default function HeinekenError(props: HeinekenErrorProps) {
  return (
    <div className="HeinekenError">
      <div className="alert alert-danger col-md-10 offset-md-1" role="alert">
        <FontAwesomeIcon icon={faTriangleExclamation} />
        &ensp;{props.error}
      </div>
    </div>
  );
}
