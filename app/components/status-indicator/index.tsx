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
    <div className="col-sm-5 offset-sm-1 col-xs-7 StatusIndicator">
      <p>
        <FontAwesomeIcon icon={faChartSimple} />
        &ensp;{text}&ensp;
        <span
          hidden={!props.overMaxWindow}
          className={"small" + (props.overMaxWindow ? "" : " hidden")}
        >
          （{ELASTIC_SEARCH_MAX_SEARCH_WINDOW + 1}件目以上は表示されません）
        </span>
      </p>
    </div>
  );
}
