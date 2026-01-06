export interface Bookmark {
  id: number;
  icon: string;
  title: string;
  url: string;
}

export type BookmarkInput = Omit<Bookmark, 'id'>;
