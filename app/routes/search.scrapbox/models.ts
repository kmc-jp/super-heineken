// scrapbox page
export interface Page {
  id: string;
  title: string;
  modified: number;
  body: string;
}

export interface PageResult {
  pages: Page[];
  totalCount: number;
  overMaxWindow: boolean;
}
