import { SEARCH_SIZE, buildScrapBoxSearch, requestSearch } from "./els-client";
import { PageResult } from "./models";
import { PageList, links as pageListLinks } from "./page-list";
import { SearchBox, links as searchBoxLinks } from "./search-box";
import { parseSearchParams, setNewOrder, setNewPage } from "./utils";
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  defer,
} from "@remix-run/node";
import {
  Await,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import { Suspense } from "react";
import HeinekenError from "~/components/heineken-error";
import { Pager, links as pagerLinks } from "~/components/pager";
import SortButton from "~/components/sort-button";
import { StatusIndicator } from "~/components/status-indicator";
import { calculateTotalPages } from "~/utils";

const sortOrderOptions = [
  { value: "s", label: "Score" },
  { value: "m", label: "Modified" },
  { value: "ta", label: "Title asc" },
  { value: "td", label: "Title desc" },
];

export const meta: MetaFunction = ({ location }) => {
  const { query } = parseSearchParams(new URLSearchParams(location.search));
  return [{ title: `${query ? `${query} - ` : ""}ScrapBox - Heineken` }];
};

export const links: LinksFunction = () => [
  ...searchBoxLinks(),
  ...pagerLinks(),
  ...pageListLinks(),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const { query, page, order, advanced } = parseSearchParams(searchParams);

  // async 内で throw Response すると Errorboundary の Error がうまくとれないのでパースは non-async でやる
  const search = buildScrapBoxSearch(order, page, advanced, query);
  const pageResult = requestSearch(search);

  const scrapboxBaseURL = process.env.HEINEKEN_SCRAPBOX_BASE_URL!;

  return defer({ pageResult, scrapboxBaseURL });
};

const createSearchBox = (params: URLSearchParams) => {
  const { query, order, advanced } = parseSearchParams(params);
  return (
    <SearchBox
      order={order}
      defaultQuery={query || ""}
      defaultAdvanced={advanced}
    />
  );
};

// @ts-expect-error SetURLSearchParams type is not exported
const createOrderSelect = (params: URLSearchParams, setSearchParams) => {
  const { order } = parseSearchParams(params);

  const onNewOrder = (order: string) => {
    // @ts-expect-error SetURLSearchParams type is not exported
    setSearchParams((prev) => {
      setNewOrder(prev, order);
      return prev;
    });
  };

  return (
    <SortButton
      options={sortOrderOptions}
      defaultOrder={order}
      onNewOrder={onNewOrder}
    />
  );
};

const createRequestingStatusIndicator = (params: URLSearchParams) => {
  const { page } = parseSearchParams(params);
  return (
    <StatusIndicator
      currentPage={page}
      totalCount={undefined}
      requesting={true}
      overMaxWindow={false}
    />
  );
};

export function ErrorBoundary() {
  const err = useRouteError();
  console.error(err);
  const [searchParams, setSearchParams] = useSearchParams();

  const msg = isRouteErrorResponse(err)
    ? err.data
    : err instanceof Error
      ? err.message
      : String(err);

  return (
    <div>
      {createSearchBox(searchParams)}
      <div className="row">
        {createRequestingStatusIndicator(searchParams)}
        {createOrderSelect(searchParams, setSearchParams)}
      </div>
      <div className="row mt-4">
        <HeinekenError error={msg} />
      </div>
    </div>
  );
}

export default function ScrapBox() {
  const navigation = useNavigation();
  // Susponse の fallback は search params の変化では起こらないので、
  // ページ変更などのときは 自前で navigation.state を見る必要がある
  // https://github.com/remix-run/react-router/discussions/8914#discussioncomment-5774149
  const requesting = navigation.state !== "idle";

  const [searchParams, setSearchParams] = useSearchParams();
  const { page } = parseSearchParams(searchParams);
  const { pageResult, scrapboxBaseURL } = useLoaderData<typeof loader>();

  const onNewPage = (page: number) => {
    setSearchParams((prev) => {
      setNewPage(prev, page);
      return prev;
    });
  };

  const render = (pageResult: PageResult) => {
    return (
      <div className="mt-3">
        <PageList pageResult={pageResult} scrapboxBaseURL={scrapboxBaseURL} />
        <Pager
          currentPage={page}
          totalPages={calculateTotalPages(
            SEARCH_SIZE,
            pageResult.totalCount,
            pageResult.overMaxWindow,
          )}
          onNewPage={onNewPage}
        />
      </div>
    );
  };

  return (
    <div>
      {createSearchBox(searchParams)}
      <div className="row">
        <Suspense fallback={createRequestingStatusIndicator(searchParams)}>
          <Await resolve={pageResult}>
            {(pr) => (
              <StatusIndicator
                currentPage={page}
                totalCount={pr.totalCount}
                requesting={requesting}
                overMaxWindow={pr.overMaxWindow}
              />
            )}
          </Await>
        </Suspense>

        {createOrderSelect(searchParams, setSearchParams)}
      </div>

      {requesting ? null : (
        <Suspense fallback={null}>
          <Await resolve={pageResult}>{(pr) => render(pr)}</Await>
        </Suspense>
      )}
    </div>
  );
}
