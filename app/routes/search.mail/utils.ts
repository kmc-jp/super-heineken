export function createM2WUrl(baseUrl: string, category: string, index: number) {
  return baseUrl + category + "/" + index.toString();
}

export function parseSearchParams(params: URLSearchParams) {
  const query = params.get("query") ?? undefined;
  const page = parseInt(params.get("page") ?? "1");
  const order = params.get("order") ?? "s";
  const c = params.getAll("category");
  const categories = c.length > 0 ? c : undefined;
  const advanced = params.get("advanced") === "on";
  return { query, page, order, categories, advanced };
}

export function setNewPage(params: URLSearchParams, page: number) {
  params.set("page", page.toString());
}

export function setNewOrder(params: URLSearchParams, order: string) {
  params.set("order", order);
  params.delete("page");
}

export function setNewCategories(
  params: URLSearchParams,
  categories: string[],
) {
  params.delete("category");
  categories.forEach((v) => params.append("category", v));
  params.delete("page");
}
