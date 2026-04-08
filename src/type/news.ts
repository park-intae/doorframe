export interface CategorySummary {
  category: string;
  keywords: string[];
  trendSummary: string;
}

export const googleNewsCategories: { [key: string]: string } = {
  '전체 뉴스': '뉴스',
  '정치': '정치',
  '경제': '경제',
  '사회': '사회',
  '생활/문화': '생활문화',
  '세계': '세계',
  'IT/과학': 'IT과학',
};

export const categoryLabelMap: Record<string, string> = Object.entries(googleNewsCategories).reduce((acc, [label, value]) => {
  acc[value] = label;
  return acc;
}, {} as Record<string, string>);
