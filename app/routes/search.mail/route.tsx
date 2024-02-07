import { SEARCH_SIZE, buildMailSearch, requestSearch } from "./els-client";
import { MessageList, links as pageListLinks } from "./message-list";
import { MessageResult } from "./models";
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
import { ELASTIC_SEARCH_MAX_SEARCH_WINDOW } from "~/utils";

const sortOrderOptions = [
  { value: "s", label: "Score" },
  { value: "d", label: "Date" },
];

export const meta: MetaFunction = ({ location }) => {
  const { query } = parseSearchParams(new URLSearchParams(location.search));
  return [{ title: `${query ? `${query} - ` : ""}Mail - Heineken` }];
};

export const links: LinksFunction = () => [
  ...searchBoxLinks(),
  ...pagerLinks(),
  ...pageListLinks(),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const defaultCategories = process.env
    .HEINEKEN_MAIL_DEFAULT_CATEGORIES!.split(",")
    .filter((v) => v !== "");

  const { query, page, order, categories, advanced } =
    parseSearchParams(searchParams);

  // async 内で throw Response すると Errorboundary の Error がうまくとれないのでパースは non-async でやる
  const search = buildMailSearch(
    order,
    page,
    categories ?? defaultCategories,
    advanced,
    query,
  );
  const messageResult = requestSearch(search);

  const mailBaseURL = process.env.HEINEKEN_MAIL_BASE_URL!;

  return defer({ messageResult, mailBaseURL });
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

export default function Mail() {
  const navigation = useNavigation();
  // Susponse の fallback は search params の変化では起こらないので、
  // ページ変更などのときは 自前で navigation.state を見る必要がある
  // https://github.com/remix-run/react-router/discussions/8914#discussioncomment-5774149
  const requesting = navigation.state !== "idle";

  const [searchParams, setSearchParams] = useSearchParams();
  const { page } = parseSearchParams(searchParams);
  const { messageResult, mailBaseURL } = useLoaderData<typeof loader>();

  const onNewPage = (page: number) => {
    setSearchParams((prev) => {
      setNewPage(prev, page);
      return prev;
    });
  };

  const render = (messageResult: MessageResult) => {
    // We cannot search over the window limit of elasticsearch.
    const totalPages = Math.min(
      Math.ceil(messageResult.totalCount / SEARCH_SIZE),
      Math.floor(ELASTIC_SEARCH_MAX_SEARCH_WINDOW / SEARCH_SIZE),
    );
    return (
      <div className="mt-3">
        <MessageList messageResult={messageResult} mailBaseURL={mailBaseURL} />
        <Pager
          currentPage={page}
          totalPages={totalPages}
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
          <Await resolve={messageResult}>
            {(mr) => (
              <StatusIndicator
                currentPage={page}
                totalCount={mr.totalCount}
                requesting={requesting}
                overMaxWindow={ELASTIC_SEARCH_MAX_SEARCH_WINDOW < mr.totalCount}
              />
            )}
          </Await>
        </Suspense>

        {createOrderSelect(searchParams, setSearchParams)}
      </div>

      {requesting ? null : (
        <Suspense fallback={null}>
          <Await resolve={messageResult}>{(mr) => render(mr)}</Await>
        </Suspense>
      )}
    </div>
  );
}
