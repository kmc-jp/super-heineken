import { Env } from "~/models";

export function truncate(text: string, max: number) {
  if (text.length > max) return text.substring(0, max) + "\u2026";
  else return text;
}

const ELASTIC_QUERY_STRING_ESACPE_CHARS = ['"', "\\"];

// Baisis: Split by space and call them as words. Words are joined with AND and quoted
// Rule 1: Quoted strings is regarded as a word (even if space-included).
// Rule 2: - in the start of a word is allowed to negative query
// Rule 3: \ is escape string

type CharType = "quote" | "minus" | "space" | "char";
type TokenState = "quoted" | "unquoted" | "noword" | "quoteend";

export function toQueryString(query: string) {
  const chars: [CharType, string][] = [];
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const escaped = i > 0 && query[i - 1] === "\\";
    if (escaped) {
      chars.push(["char", char]);
      continue;
    }

    switch (char) {
      case "-":
        chars.push(["minus", char]);
        break;
      case '"':
        chars.push(["quote", char]);
        break;
      case " ":
        chars.push(["space", char]);
        break;
      case "\\":
        // Esscape -> ignore
        break;
      default:
        chars.push(["char", char]);
        break;
    }
  }

  const words: [string, positive: boolean][] = [];
  let state: TokenState = "noword";
  let currentWord = "";
  let positive = true;

  const endWord = () => {
    words.push([currentWord, positive]);
    currentWord = "";
    positive = true;
  };

  for (const [type, char] of chars) {
    switch (type) {
      case "char":
        switch (state) {
          case "quoted":
          case "unquoted":
            currentWord += char;
            break;
          case "noword":
            state = "unquoted";
            currentWord += char;
            break;
          case "quoteend":
            throw new Response(
              "Query parse error: 単語と単語の間はスペースを入れてください",
              { status: 400 },
            );
        }
        break;

      case "minus":
        switch (state) {
          case "quoted":
          case "unquoted":
            currentWord += char; // Treat as a normal char in words
            break;
          case "noword":
            positive = false;
            break;
          case "quoteend":
            throw new Response(
              "Query parse error: 単語と単語の間はスペースを入れてください",
              { status: 400 },
            );
        }
        break;

      case "space":
        switch (state) {
          case "quoted":
            currentWord += char;
            break;
          case "unquoted":
            endWord();
            state = "noword";
            break;
          case "noword":
            if (!positive) {
              throw new Response(
                "Query parse error: '-' は単語の直前か単語内にのみ配置できます",
                { status: 400 },
              );
            }
            break;
          case "quoteend":
            state = "noword";
            break;
        }
        break;

      case "quote":
        switch (state) {
          case "quoted":
            endWord();
            state = "quoteend";
            break;
          case "unquoted":
            throw new Response(
              "Query parse error: '\"' を単語内で用いる場合は '\\' でエスケープしてください",
              { status: 400 },
            );
          case "noword":
            state = "quoted";
            break;
          case "quoteend":
            throw new Response(
              "Query parse error: 単語と単語の間はスペースを入れてください",
              { status: 400 },
            );
        }
        break;
    }
  }

  // End
  switch (state) {
    case "quoted":
      throw new Response("Query parse error: '\"' の対応が合いません", {
        status: 400,
      });
    case "unquoted":
      endWord();
      break;
    case "noword":
    case "quoteend":
      break;
  }

  for (const [word] of words) {
    if (word.length < 2) {
      throw new Response("Query error: 各単語の長さは 2 以上にしてください", {
        status: 400,
      });
    }
  }

  return words
    .map(([word, positive]) => {
      let escaped = word;
      for (const char of ELASTIC_QUERY_STRING_ESACPE_CHARS) {
        escaped = escaped.replaceAll(char, "\\" + char);
      }
      return `${positive ? "" : "-"}"${escaped}"`;
    })
    .join(" AND ");
}

export const calculateTotalPages = (
  searchSize: number,
  totalCount: number,
  overMaxWindow: boolean,
) => {
  // overMaxWindow のときは最後のページが max window 以上の結果を指してしまいエラーになる
  return (overMaxWindow ? Math.floor : Math.ceil)(totalCount / searchSize);
};

export const getServerEnv = () => {
  const defaultCategories = process.env
    .HEINEKEN_MAIL_DEFAULT_CATEGORIES!.split(",")
    .filter((v) => v !== "");

  const allCategories = process.env
    .HEINEKEN_MAIL_CATEGORIES!.split(",")
    .filter((v) => v !== "");

  const env: Env = {
    elasticSearchURL: process.env.HEINEKEN_ELASTIC_SEARCH_URL!,
    elasticSearchPukiWikiIndex:
      process.env.HEINEKEN_ELASTIC_SEARCH_PUKIWIKI_INDEX!,
    elasticSearchMailIndex: process.env.HEINEKEN_ELASTIC_SEARCH_MAIL_INDEX!,
    elasticSearchScrapboxIndex:
      process.env.HEINEKEN_ELASTIC_SEARCH_SCRAPBOX_INDEX!,
    pukiWikiBaseURL: process.env.HEINEKEN_PUKIWIKI_BASE_URL!,
    mailCategories: allCategories,
    mailDefaultCategories: defaultCategories,
    mailBaseURL: process.env.HEINEKEN_MAIL_BASE_URL!,
    scrapboxBaseURL: process.env.HEINEKEN_SCRAPBOX_BASE_URL!,
  };

  return env;
};
