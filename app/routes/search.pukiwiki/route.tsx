import { SEARCH_SIZE, buildPukiWikiSearch, requestSearch } from "./els-client";
import { PageResult } from "./models";
import { PageList, links as pageListLinks } from "./page-list";
import { SearchBox, links as searchBoxLinks } from "./search-box";
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
import { ELASTIC_SEARCH_MAX_SEARCH_WINDOW } from "~/utils";
import { parseSearchParams, setNewOrder, setNewPage } from "~/utils/pukiwiki";

export const meta: MetaFunction = ({ location }) => {
  const { query } = parseSearchParams(new URLSearchParams(location.search));
  return [{ title: `${query ? `${query} - ` : ""}PukiWiki - Heineken` }];
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
  const search = buildPukiWikiSearch(order, page, advanced, query);
  const pageResult = requestSearch(search);

  const pukiwikiBaseURL = process.env.HEINEKEN_PUKIWIKI_BASE_URL!;

  return defer({ pageResult, pukiwikiBaseURL });
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

  return <SortButton defaultOrder={order} onNewOrder={onNewOrder} />;
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
    <div className="PukiWiki">
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

export default function PukiWiki() {
  const navigation = useNavigation();
  // Susponse の fallback は search params の変化では起こらないので、
  // ページ変更などのときは 自前で navigation.state を見る必要がある
  // https://github.com/remix-run/react-router/discussions/8914#discussioncomment-5774149
  const requesting = navigation.state !== "idle";

  const [searchParams, setSearchParams] = useSearchParams();
  const { page } = parseSearchParams(searchParams);
  const { pageResult, pukiwikiBaseURL } = useLoaderData<typeof loader>();

  const onNewPage = (page: number) => {
    setSearchParams((prev) => {
      setNewPage(prev, page);
      return prev;
    });
  };

  const render = (pageResult: PageResult) => {
    // We cannot search over the window limit of elasticsearch.
    const totalPages = Math.min(
      Math.ceil(pageResult.totalCount / SEARCH_SIZE),
      Math.floor(ELASTIC_SEARCH_MAX_SEARCH_WINDOW / SEARCH_SIZE),
    );
    return (
      <div className="mt-3">
        <PageList pageResult={pageResult} pukiwikiBaseURL={pukiwikiBaseURL} />
        <Pager
          currentPage={page}
          totalPages={totalPages}
          onNewPage={onNewPage}
        />
      </div>
    );
  };

  return (
    <div className="PukiWiki">
      {createSearchBox(searchParams)}
      <div className="row">
        <Suspense fallback={createRequestingStatusIndicator(searchParams)}>
          <Await resolve={pageResult}>
            {(pr) => (
              <StatusIndicator
                currentPage={page}
                totalCount={pr.totalCount}
                requesting={requesting}
                overMaxWindow={ELASTIC_SEARCH_MAX_SEARCH_WINDOW < pr.totalCount}
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
