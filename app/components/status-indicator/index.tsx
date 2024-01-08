import { faChartSimple } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ELASTIC_SEARCH_MAX_SEARCH_WINDOW } from "~/utils";

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
    text = `${pageStr}${props.totalCount!} hits`;
  }
  return (
    <div className="col-7 offset-md-1 StatusIndicator">
      <p>
        <FontAwesomeIcon icon={faChartSimple} />
        &ensp;{text}&ensp;
        <span
          className={
            "small d-none" + (props.overMaxWindow ? " d-sm-inline-block" : "")
          }
        >
          （{ELASTIC_SEARCH_MAX_SEARCH_WINDOW + 1}件目以上は表示されません）
        </span>
      </p>
    </div>
  );
}
