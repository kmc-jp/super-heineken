import { Page, PageResult } from "./models";
import styles from "./page-list.css";
import { createScrapBoxUrl } from "./utils";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface PageListItemProps {
  page: Page;
  scrapboxBaseURL: string;
}

function PageListItem(props: PageListItemProps) {
  // scrapboxのmodifiedはunix timestamp
  const dateStr = new Date(props.page.modified * 1000).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  return (
    <div className="row PageListItem mb-2">
      <div className="col-md-10 offset-md-1">
        <a href={createScrapBoxUrl(props.scrapboxBaseURL, props.page.title)}>
          <h3>{props.page.title}</h3>
        </a>
        <p className="small mb-2">
          <FontAwesomeIcon icon={faCalendar} />
          &ensp;{dateStr}
        </p>
        <p dangerouslySetInnerHTML={{ __html: props.page.body }} />
      </div>
    </div>
  );
}

interface PageListProps {
  pageResult: PageResult;
  scrapboxBaseURL: string;
}

export function PageList(props: PageListProps) {
  return (
    <div className="PageList">
      {props.pageResult.pages.map((item) => (
        <PageListItem
          key={item.id}
          page={item}
          scrapboxBaseURL={props.scrapboxBaseURL}
        />
      ))}
    </div>
  );
}
