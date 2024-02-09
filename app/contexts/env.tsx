import { createContext } from "react";
import { Env } from "~/models";

export const EnvContext = createContext<Env>({
  elasticSearchURL: "",
  elasticSearchPukiWikiIndex: "",
  elasticSearchMailIndex: "",
  elasticSearchScrapboxIndex: "",
  pukiWikiBaseURL: "",
  mailCategories: [],
  mailDefaultCategories: [],
  mailBaseURL: "",
  scrapboxBaseURL: "",
});
