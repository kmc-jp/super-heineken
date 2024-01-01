// pukiwiki page
export interface Page {
  id: string;
  title: string;
  titleUrlEncoded: string;
  modified: number;
  body: string;
}

export interface PageResult {
  pages: Page[];
  totalCount: number;
}
