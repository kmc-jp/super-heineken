// Result list is isolated to reduce load time and show loading indicator collectly
import { PageResult } from "../search._pukiwiki-base.pukiwiki/models";
import { SearchBox, links as searchBoxLinks } from "./search-box";
// import styles from "./help.css";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Await,
  Outlet,
  useMatches,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { Suspense } from "react";
import { StatusIndicator } from "~/components/status-indicator";
import { ELASTIC_SEARCH_MAX_SEARCH_WINDOW } from "~/utils";
import { parseSearchParams } from "~/utils/pukiwiki";

export const meta: MetaFunction = () => {
  return [{ title: "PukiWiki - Heineken" }];
};

export const links: LinksFunction = () => [...searchBoxLinks()];

// const sortOrders = new Map([
//   ["s", "Score"],
//   ["m", "Modified"],
//   ["ta", "Title asc"],
//   ["td", "Title desc"],
// ]);

export default function PukiWikiBase() {
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const { query, page, order, advanced } = parseSearchParams(searchParams);
  const matches = useMatches();
  const data = matches[matches.length - 1]?.data as
    | { pageResult: PageResult }
    | undefined;
  const requesting = navigation.state !== "idle";

  // const onNewSort = (sort: string) => {
  //   setSearchParams((prev) => {
  //     setNewOrder(prev, sort);
  //     return prev;
  //   });
  // };

  const createRequestingStatusIndicator = () => (
    <StatusIndicator
      currentPage={page}
      totalCount={undefined}
      requesting={true}
      overMaxWindow={false}
    />
  );

  return (
    <div className="PukiWikiRoot">
      <SearchBox
        order={order}
        defaultQuery={query || ""}
        defaultAdvanced={advanced}
      />
      <div className="row">
        {!data ? (
          createRequestingStatusIndicator()
        ) : (
          <Suspense fallback={createRequestingStatusIndicator()}>
            {/* HACK: Just ignore error here because the child errorBoundry will handle */}
            <Await resolve={data.pageResult} errorElement={<div />}>
              {(pr) => (
                <StatusIndicator
                  currentPage={page}
                  totalCount={pr.totalCount}
                  requesting={requesting}
                  overMaxWindow={
                    ELASTIC_SEARCH_MAX_SEARCH_WINDOW < pr.totalCount
                  }
                />
              )}
            </Await>
          </Suspense>
        )}
        {/* <SortButton
          data={
            new SortButtonPropsData(
              data.searchQuery.order,
              this.constructor.sorts,
            )
          }
        /> */}
      </div>
      <Outlet />
    </div>
  );
}
