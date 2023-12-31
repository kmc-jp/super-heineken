import styles from "./index.css";
import { LinksFunction } from "@remix-run/node";
import { ReactNode } from "react";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface PagerItemProps {
  children?: ReactNode;
  currentPage: number;
  page: number;
  disabled: boolean;
  onNewPage: (page: number) => void;
}

function PagerItem(props: PagerItemProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClick = () => {
    if (!props.disabled) {
      props.onNewPage(props.page);
    }
  };

  const bstClass = props.disabled
    ? "disabled"
    : props.currentPage === props.page
      ? "active"
      : "";

  return (
    <li className={"PagerItem page-item " + bstClass}>
      <span className="page-link" onClick={handleClick}>
        {props.children || props.page}
      </span>
    </li>
  );
}

interface PagerProps {
  currentPage: number;
  totalPages: number;
  onNewPage: (page: number) => void;
}

// for pc
function PagerDefault(props: PagerProps) {
  const edgeCountRequired = 2; // [1 2] ... [6 7] 8 (current) [9 10] ... [12 13]
  const allLimit = edgeCountRequired * 4 + 1 + 2; // start edge + [...] + before edge + current + after edge + [...] + end edge
  // Max page number to merge start edges
  // OK: 1 2 3 4 5 (current) [6 7] ... [12 13]
  // NG: 1 2 3 4 5 6 (current) [7] ... [12 13] (Too small edge!)
  const edgeStartCurrentLimit = allLimit - edgeCountRequired * 2 - 1; // All limit - after edge  - [...]  - end edge
  // Min page number to merge end edges
  const edgeEndCurrentLimit = props.totalPages - edgeStartCurrentLimit + 1; // Reversed from start limit

  const prevItem = () => {
    const current = props.currentPage;
    return (
      <PagerItem
        key="prev"
        currentPage={props.currentPage}
        page={current - 1}
        disabled={current <= 1}
        onNewPage={props.onNewPage}
      >
        Prev
      </PagerItem>
    );
  };

  const nextItem = () => {
    const current = props.currentPage;
    return (
      <PagerItem
        key="next"
        currentPage={props.currentPage}
        page={current + 1}
        disabled={current >= props.totalPages}
        onNewPage={props.onNewPage}
      >
        Next
      </PagerItem>
    );
  };

  // Renders [...]
  // if you use multiple divider, specify key
  const divider = (key: string = "divider") => {
    return (
      <li className="PagerItem page-item disabled" key={key}>
        <span className="page-link">&hellip;</span>
      </li>
    );
  };

  const numberedItemList = (start: number, end: number) => {
    return [...new Array(end - start + 1)]
      .map((v, i) => {
        return i + start;
      })
      .map((page) => (
        <PagerItem
          key={page}
          currentPage={props.currentPage}
          page={page}
          disabled={false}
          onNewPage={props.onNewPage}
        />
      ));
  };

  const startEdge = () => {
    return numberedItemList(1, edgeCountRequired);
  };

  const endEdge = () => {
    return numberedItemList(
      props.totalPages - edgeCountRequired + 1,
      props.totalPages,
    );
  };

  const current = props.currentPage;
  const total = props.totalPages;

  let child;
  if (total <= allLimit) {
    child = numberedItemList(1, total);
  } else {
    // use ...
    if (edgeStartCurrentLimit >= current) {
      // 1 2 3 4 5 (current) 6 7 ... [12 13]
      child = [
        ...numberedItemList(1, edgeStartCurrentLimit + edgeCountRequired),
        divider(),
        ...endEdge(),
      ];
      // [1 2] ... 7 8 9 (current) 10 11 12 13
    } else if (edgeEndCurrentLimit <= current) {
      child = [
        ...startEdge(),
        divider(),
        ...numberedItemList(edgeEndCurrentLimit - edgeCountRequired, total),
      ];
    } else {
      // [1 2] ... [6 7] 8 (current) [9 10] ... [12 13]
      child = [
        ...startEdge(),
        divider("div1"),
        ...numberedItemList(
          current - edgeCountRequired,
          current + edgeCountRequired,
        ),
        divider("div2"),
        ...endEdge(),
      ];
    }
  }

  return (
    <div className="PageListPagerDefault d-none d-sm-block">
      <nav>
        <ul className="pagination justify-content-center">
          {[prevItem(), ...child, nextItem()]}
        </ul>
      </nav>
    </div>
  );
}

// for smartphone. No ... divider and first / last links
function PagerXS(props: PagerProps) {
  const current = props.currentPage;
  const total = props.totalPages;

  const startExceeded = current - 2 < 1;
  const endExceeded = current + 2 > total;

  const start = startExceeded
    ? 1
    : endExceeded
      ? Math.max(1, total - 4)
      : current - 2;
  const end = endExceeded
    ? total
    : startExceeded
      ? Math.min(total, 5)
      : current + 2;

  return (
    <div className="PageListPagerXS d-block d-sm-none">
      <nav>
        <ul className="pagination justify-content-center">
          <PagerItem
            currentPage={props.currentPage}
            page={current - 1}
            disabled={current <= 1}
            onNewPage={props.onNewPage}
          >
            &lt;
          </PagerItem>
          {[...new Array(end - start + 1)]
            .map((v, i) => i + start)
            .map((page) => (
              <PagerItem
                key={page}
                currentPage={props.currentPage}
                page={page}
                disabled={false}
                onNewPage={props.onNewPage}
              />
            ))}
          <PagerItem
            currentPage={props.currentPage}
            page={current + 1}
            disabled={current >= total}
            onNewPage={props.onNewPage}
          >
            &gt;
          </PagerItem>
        </ul>
      </nav>
    </div>
  );
}

export function Pager(props: PagerProps) {
  return (
    <div className="row">
      <PagerXS {...props} />
      <PagerDefault {...props} />
    </div>
  );
}
