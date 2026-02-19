import React from 'react';
import { googleNewsCategories } from '../../../../../type/news';

interface NewsBriefInputProps {
  category: string;
  setCategory: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  handleSummarize: () => void;
  loading: boolean;
}

const NewsBriefInput: React.FC<NewsBriefInputProps> = ({
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
  handleSummarize,
  loading,
}) => {
  return (
    <div className="flex flex-col gap-3 smDT:w-[220px] mdDT:w-full">
      <div className="flex flex-col">
        <label htmlFor="category" className="text-xs text-context mb-1 ml-1">카테고리</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full px-3 py-2 bg-main/50 border border-main rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-point/50 focus:border-point text-sm transition-all"
        >
          {Object.entries(googleNewsCategories).map(([name, keyword]) => (
            <option key={keyword} value={keyword}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="searchQuery" className="text-xs text-context mb-1 ml-1">검색 키워드 (선택)</label>
        <input
          type="text"
          id="searchQuery"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="예: AI, 금리, 삼성전자"
          className="block w-full px-3 py-2 bg-main/50 border border-main rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-point/50 focus:border-point text-sm transition-all placeholder:text-context/50"
        />
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="mt-2 w-full bg-point text-main py-2.5 px-4 rounded-xl font-bold hover:brightness-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-point/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-point/20"
      >
        {loading ? '요약 중...' : '뉴스 요약하기'}
      </button>
    </div>
  );
};

export default NewsBriefInput;
