import { Page, PageResult } from "./models";
import styles from "./page-list.css";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinksFunction } from "@remix-run/node";
import { createPukiwikiUrl } from "~/utils/pukiwiki";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface PageListItemProps {
  page: Page;
  pukiwikiBaseURL: string;
}

function PageListItem(props: PageListItemProps) {
  const dateStr = new Date(props.page.modified).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  return (
    <div className="row PageListItem mb-2">
      <div className="col-sm-10 offset-sm-1">
        <a
          href={createPukiwikiUrl(
            props.pukiwikiBaseURL,
            props.page.titleUrlEncoded,
          )}
        >
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
  pukiwikiBaseURL: string;
}

export function PageList(props: PageListProps) {
  return (
    <div className="PageList">
      {props.pageResult.pages.map((item) => (
        <PageListItem
          key={item.id}
          page={item}
          pukiwikiBaseURL={props.pukiwikiBaseURL}
        />
      ))}
    </div>
  );
}
