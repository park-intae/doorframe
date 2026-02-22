import React, { useEffect, useRef, useState } from 'react';
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
    <div className="flex flex-col gap-3 smDT:w-[220px] mdDT:w-full">
      <div ref={dropdownRef} className="flex flex-col w-48 relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full py-2 text-sm font-paperlogy text-left transition-all glass-input hover:!bg-white/15 focus:outline-none flex justify-center items-center"
        >
          {category
            ? Object.entries(googleNewsCategories).find(
              ([, value]) => value === category
            )?.[0]
            : '카테고리 선택'}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <ul
            className="absolute z-50 top-full w-full rounded-xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/10 overflow-hidden">
            {Object.entries(googleNewsCategories).map(([name, value]) => (
              <li
                key={value}
                onClick={() => {
                  setCategory(value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-sm font-paperlogy cursor-pointer transition-all hover:bg-blue-300 hover:text-point
                  ${category === value
                    ? 'text-point border-l-2 border-point bg-white/10'
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

      <div className="flex flex-col">
        <input
          type="text"
          id="searchQuery"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="예: AI, 금리, 삼성전자"
          className="block smDT:w-48 mdDT:w-80 px-3 py-2 text-sm font-paperlogy transition-all placeholder:text-context/50 glass-input hover:bg-white focus:outline-none focus:border-point/50 focus:!bg-white focus:shadow-lg focus:shadow-point/10"
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
