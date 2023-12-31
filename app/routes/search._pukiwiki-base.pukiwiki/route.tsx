// Elasticsearch 起因のエラーを表示する Component をわけるために route を分けている
import { SEARCH_SIZE, buildPukiWikiSearch, requestSearch } from "./els-client";
import { PageResult } from "./models";
import { PageList, links as pageListLinks } from "./page-list";
import { LinksFunction, LoaderFunctionArgs, defer } from "@remix-run/node";
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
import { ELASTIC_SEARCH_MAX_SEARCH_WINDOW } from "~/utils";
import { parseSearchParams, setNewPage } from "~/utils/pukiwiki";

export const links: LinksFunction = () => [...pagerLinks(), ...pageListLinks()];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const { query, page, order, advanced } = parseSearchParams(searchParams);

  // async 内で throw Response するとうまくいかないのでパースは non-async でやる
  const search = buildPukiWikiSearch(order, page, advanced, query);
  const pageResult = requestSearch(search);

  const pukiwikiBaseURL = process.env.HEINEKEN_PUKIWIKI_BASE_URL!;

  return defer({ pageResult, pukiwikiBaseURL });
};

export function ErrorBoundary() {
  const err = useRouteError();
  console.error(err);
  const msg = isRouteErrorResponse(err)
    ? err.data
    : err instanceof Error
      ? err.message
      : String(err);

  return (
    <div className="row mt-4">
      <HeinekenError error={msg} />
    </div>
  );
}

export default function PukiWikiResult() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page } = parseSearchParams(searchParams);
  const { pageResult, pukiwikiBaseURL } = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  const requesting = state !== "idle";

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
      <div>
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
    <div className="PukiWikiResult">
      <div>
        {requesting ? (
          <div />
        ) : (
          <Suspense fallback={<div />}>
            <Await resolve={pageResult}>{(pr) => render(pr)}</Await>
          </Suspense>
        )}
      </div>
    </div>
  );
}
