export function createPukiwikiUrl(baseUrl: string, titleUrlEncoded: string) {
  return baseUrl + "?" + titleUrlEncoded;
}

export function createTitle(query: string) {
  return query ? `${query} - PukiWiki - Heineken` : "PukiWiki - Heineken";
}

export function parseSearchParams(params: URLSearchParams) {
  const query = params.get("query") ?? undefined;
  const page = parseInt(params.get("page") ?? "1");
  const order = params.get("order") ?? "s";
  const advanced = params.get("advanced") === "on";
  return { query, page, order, advanced };
}

export function setNewPage(params: URLSearchParams, page: number) {
  params.set("page", page.toString());
}

export function setNewOrder(params: URLSearchParams, order: string) {
  params.set("order", order);
  params.delete("page");
}
