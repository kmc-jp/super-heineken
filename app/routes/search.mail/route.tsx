import {
  SearchBox,
  links as searchBoxLinks,
} from "../../components/search-box";
import { SEARCH_SIZE, buildMailSearch, requestSearch } from "./els-client";
import { MessageList, links as pageListLinks } from "./message-list";
import { MessageResult } from "./models";
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
import { Suspense, useContext } from "react";
import HeinekenError from "~/components/heineken-error";
import { Pager, links as pagerLinks } from "~/components/pager";
import SortButton from "~/components/sort-button";
import { StatusIndicator } from "~/components/status-indicator";
import { EnvContext } from "~/contexts/env";
import { calculateTotalPages } from "~/utils";

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

  const { query, page, order, categories, advanced } =
    parseSearchParams(searchParams);

  // async 内で throw Response すると Errorboundary の Error がうまくとれないのでパースは non-async でやる
  const search = buildMailSearch(order, page, categories, advanced, query);
  const messageResult = requestSearch(search);

  return defer({
    messageResult,
  });
};

const createSearchBox = (
  params: URLSearchParams,
  defaultCategories: string[],
  allCategories: string[],
) => {
  const { query, order, advanced, categories } = parseSearchParams(params);
  const extraCategories = (categories ?? []).filter(
    (v) => !allCategories.includes(v),
  );
  const types = [...extraCategories, ...allCategories].map((v) => {
    return { value: v, label: v };
  });
  return (
    <SearchBox
      order={order}
      types={types}
      action={"/search/mail"}
      defaultTypes={categories ?? defaultCategories}
      typeInputName="category"
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
  const { mailDefaultCategories, mailCategories } = useContext(EnvContext);

  const msg = isRouteErrorResponse(err)
    ? err.data
    : err instanceof Error
      ? err.message
      : String(err);

  return (
    <div>
      {createSearchBox(searchParams, mailDefaultCategories, mailCategories)}
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
  const { mailBaseURL, mailDefaultCategories, mailCategories } =
    useContext(EnvContext);
  const { messageResult } = useLoaderData<typeof loader>();

  const onNewPage = (page: number) => {
    setSearchParams((prev) => {
      setNewPage(prev, page);
      return prev;
    });
  };

  const render = (messageResult: MessageResult) => {
    return (
      <div className="mt-3">
        <MessageList messageResult={messageResult} mailBaseURL={mailBaseURL} />
        <Pager
          currentPage={page}
          totalPages={calculateTotalPages(
            SEARCH_SIZE,
            messageResult.totalCount,
            messageResult.overMaxWindow,
          )}
          onNewPage={onNewPage}
        />
      </div>
    );
  };

  return (
    <div>
      {createSearchBox(searchParams, mailDefaultCategories, mailCategories)}
      <div className="row">
        <Suspense fallback={createRequestingStatusIndicator(searchParams)}>
          <Await resolve={messageResult}>
            {(mr) => (
              <StatusIndicator
                currentPage={page}
                totalCount={mr.totalCount}
                requesting={requesting}
                overMaxWindow={mr.overMaxWindow}
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
