import { Page, PageResult } from "./models";
import { getServerEnv, toQueryString } from "~/utils";

export const SEARCH_SIZE = 35;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPageFromResponse(json: any): Page {
  return {
    id: json._id,
    title: json._source.title,
    titleUrlEncoded: json._source.title_url_encoded,
    modified: json._source.modified,
    body: json.highlight.body[0],
  };
}

// From elasticsearch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPageResultFromResponse(json: any): PageResult {
  return {
    pages: json.hits.hits.map((item: unknown) => createPageFromResponse(item)),
    totalCount: json.hits.total.value,
    overMaxWindow: json.hits.total.relation === "gte",
  };
}

export function buildPukiWikiSearch(
  order: string,
  page: number,
  useRawQuery: boolean,
  query?: string,
) {
  let queryString: string;
  if (query == null || query == "") {
    queryString = "*";
  } else {
    queryString = useRawQuery ? query : toQueryString(query);
  }
  return {
    query: queryString,
    size: SEARCH_SIZE,
    from: (page - 1) * SEARCH_SIZE,
    order: order,
  };
}

interface PukiWikiSearch {
  query: string;
  size: number;
  from: number;
  order: string;
}

export async function requestSearch({
  query,
  size,
  from,
  order,
}: PukiWikiSearch) {
  const { elasticSearchURL, elasticSearchPukiWikiIndex } = getServerEnv();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryJson: any = {
    query: {
      function_score: {
        query: {
          query_string: {
            // boost by title
            fields: ["title^5", "body"],
            query: query,
            default_operator: "AND",
          },
        },
      },
    },
    _source: ["modified", "title", "title_url_encoded"],
    size: size,
    from: from,
  };

  // eslint-disable-next-line default-case
  switch (order) {
    case "m":
      queryJson["sort"] = { modified: "desc" };
      break;
    case "ta":
      queryJson["sort"] = { "title.keyword": "asc" };
      break;
    case "td":
      queryJson["sort"] = { "title.keyword": "desc" };
      break;
    case "s":
      queryJson["sort"] = ["_score", { modified: "desc" }];
      queryJson["query"]["function_score"]["functions"] = [
        {
          // boost by date
          exp: {
            modified: {
              // tekitou iikanji values~~
              offset: "150d",
              scale: "500d",
              decay: 0.75,
            },
          },
        },
        {
          script_score: {
            // boost by title length (jakkan)
            script: {
              inline:
                "_score / Math.sqrt(Math.log1p(doc['title.keyword'].value.length()))",
            },
          },
        },
      ];
      break;
  }

  queryJson["highlight"] = {
    // html escape
    encoder: "html",
    fields: {
      body: {
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"],
        fragment_size: 220,
        no_match_size: 220,
        number_of_fragments: 1,
      },
    },
  };

  const url = new URL(
    "_search",
    elasticSearchURL + elasticSearchPukiWikiIndex + "/",
  );
  url.searchParams.append("source", JSON.stringify(queryJson));
  url.searchParams.append("source_content_type", "application/json");

  const response = await fetch(url);
  if (!response.ok) {
    console.error(await response.json());
    throw new Response(
      `Invalid response from the backend elasticsearch server: ${response.statusText}`,
      { status: 500 },
    );
  }
  const json = await response.json();
  return createPageResultFromResponse(json);
}
