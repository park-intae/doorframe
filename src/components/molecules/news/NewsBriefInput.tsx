import React, { useEffect, useRef, useState } from 'react';
import { googleNewsCategories, categoryLabelMap } from '../../../type/news';

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

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2.5 w-full flex-shrink-0">
      <div className="flex gap-2 w-full">
        <div ref={dropdownRef} id="BriefCateContainer" className="flex flex-col w-36 smDT:w-40 relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            id='categoryList'
            className="w-full py-2 text-sm font-paperlogy text-left transition-all glass-input hover:!bg-white/15 focus:outline-none flex justify-center items-center"
          >
            {category ? (categoryLabelMap[category] || '카테고리 선택') : '카테고리 선택'}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <ul
              onWheel={(e) => e.stopPropagation()}
              className="absolute z-50 top-full w-full rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-black/20 dark:border-white/20 shadow-xl overflow-hidden max-h-48 overflow-y-auto scrollbar-thin">
              {Object.entries(googleNewsCategories).map(([name, value]) => (
                <li
                  key={value}
                  onClick={() => {
                    setCategory(value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-paperlogy cursor-pointer transition-all hover:bg-point/10 hover:text-point
                    ${category === value
                      ? 'text-point border-l-2 border-point bg-point/10 font-bold'
                      : 'text-title border-l-2 border-transparent'
                    }
                 `}
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="keywordContainer" className="flex flex-col flex-1 min-w-0">
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="예: AI, 반도체"
            className="w-full px-3 py-2 text-sm font-paperlogy transition-all placeholder:text-context/50 glass-input hover:bg-white focus:outline-none focus:border-point/50 focus:!bg-white focus:shadow-lg focus:shadow-point/10"
          />
        </div>
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading}
        id="sumBtn"
        className="w-full bg-point text-main py-2 px-4 rounded-xl font-bold font-paperlogy hover:brightness-105 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-point/20"
      >
        {loading ? '요약 중...' : '뉴스 요약하기'}
      </button>
    </div>
  );
};

export default NewsBriefInput;
