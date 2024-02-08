import { faChartSimple } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface StatusIndicatorProps {
  currentPage: number;
  totalCount?: number;
  requesting: boolean;
  overMaxWindow: boolean;
}

// Show requesting indicator OR current page
export function StatusIndicator(props: StatusIndicatorProps) {
  let text;
  if (props.requesting) {
    text = "Searching...";
  } else {
    const page = props.currentPage;
    const pageStr = page > 1 ? `Page ${page} of ` : "";
    text = `${pageStr}${props.totalCount!}${props.overMaxWindow ? "+" : ""} hits`;
  }
  return (
    <div className="col-5 offset-md-1 StatusIndicator">
      <p>
        <FontAwesomeIcon icon={faChartSimple} />
        &ensp;{text}
      </p>
    </div>
  );
}
