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
      <div className="flex flex-col w-48">
        <div className="relative">
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 pr-10 text-sm font-paperlogy appearance-none transition-all duration-200 hover:bg-white/15 focus:outline-none glass-input">
            <option value="" disabled hidden>
              카테고리 선택
            </option>
            {Object.entries(googleNewsCategories).map(([name, keyword]) => (
              <option key={keyword} value={keyword}>
                {name}
              </option>
            ))}
          </select>

          {/* 커스텀 화살표 */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-context">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <input
          type="text"
          id="searchQuery"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="예: AI, 금리, 삼성전자"
          className="block w-80 px-3 py-2 text-sm font-paperlogy transition-all placeholder:text-context/50 glass-input hover:bg-white focus:outline-none focus:border-point/50 focus:!bg-white focus:shadow-lg focus:shadow-point/10"
        />
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="mt-2 w-full bg-point text-main py-2.5 px-4 rounded-xl font-bold font-paperlogy hover:brightness-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-point/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-point/20"
      >
        {loading ? '요약 중...' : '뉴스 요약하기'}
      </button>
    </div>
  );
};

export default NewsBriefInput;
