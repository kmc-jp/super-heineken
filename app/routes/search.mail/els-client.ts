import { Message, MessageResult } from "./models";
import { toQueryString } from "~/utils";

export const SEARCH_SIZE = 35;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMessageFromResponse(json: any): Message {
  return {
    id: json._id,
    category: json._source.category,
    index: json._source.index,
    from: json._source.from,
    to: json._source.to,
    subject: json._source.subject,
    date: json._source.date,
    body: json.highlight.body[0],
  };
}

// From elasticsearch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMessageResultFromResponse(json: any): MessageResult {
  return {
    messages: json.hits.hits.map((item: unknown) =>
      createMessageFromResponse(item),
    ),
    totalCount: json.hits.total.value,
    overMaxWindow: json.hits.total.relation === "gte",
  };
}

export function buildMailSearch(
  order: string,
  page: number,
  categories: string[],
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
    categories: categories,
  };
}

interface MailSearch {
  query: string;
  size: number;
  from: number;
  order: string;
  categories: string[];
}

export async function requestSearch({
  query,
  size,
  from,
  order,
  categories,
}: MailSearch) {
  // boot by some fields
  const fields = ["subject^3", "from^4", "to^4", "body"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryJson: any = {
    query: {
      bool: {
        must: {
          function_score: {
            query: {
              query_string: {
                fields: fields,
                query: query,
                default_operator: "AND",
              },
            },
          },
        },

        filter: {
          terms: {
            category: categories,
          },
        },
      },
    },
    _source: ["subject", "from", "to", "date", "category", "index"],
    size: size,
    from: from,
  };

  // eslint-disable-next-line default-case
  switch (order) {
    case "d":
      queryJson["sort"] = { date: "desc" };
      break;
    case "s":
      queryJson["sort"] = ["_score", { date: "desc" }];
      queryJson["query"]["bool"]["must"]["function_score"]["functions"] = [
        {
          // boost by date
          exp: {
            date: {
              // tekitou iikanji values~~
              offset: "150d",
              scale: "500d",
              decay: 0.75,
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
    process.env.HEINEKEN_ELASTIC_SEARCH_URL! +
      process.env.HEINEKEN_ELASTIC_SEARCH_MAIL_INDEX! +
      "/",
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
  return createMessageResultFromResponse(json);
}
