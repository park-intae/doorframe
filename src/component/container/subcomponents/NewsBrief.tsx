// src/component/container/subcomponents/NewsBrief.tsx

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js'; // Supabase 클라이언트 임포트
import Typewriter from 'typewriter-effect'; // Typewriter 라이브러리 임포트

// Supabase 클라이언트 초기화 (Vite 환경 변수 사용)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수가 없는 경우 에러를 발생시켜 설정이 누락되었음을 명확히 합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 .env 파일에 설정되어야 합니다.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CategorySummary {
  category: string;
  keywords: string[];
  trendSummary: string;
}

// 구글 뉴스 검색 카테고리 (네이버에서 검색)
const googleNewsCategories: { [key: string]: string } = {
  '전체 뉴스': '뉴스',
  '정치': '정치',
  '경제': '경제',
  '사회': '사회',
  '생활/문화': '생활문화',
  '세계': '세계',
  'IT/과학': 'IT과학',
};

const NewsBriefing: React.FC = () => {
  const [category, setCategory] = useState<string>('경제'); // 기본값 '경제'
  const [searchQuery, setSearchQuery] = useState<string>(''); // 검색어 상태 추가
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setCategorySummary(null); // Clear previous summary

    const filterCategory = category; // Edge Function에 보낼 필터 카테고리

    try {
      // Supabase Edge Function 호출 시 rssUrl 대신 filterCategory와 searchQuery를 전송
      const { data, error: functionError } = await supabase.functions.invoke('news-briefing', {
        body: JSON.stringify({ filterCategory, searchQuery }), // rssUrl 제거, searchQuery 추가
        headers: { 'Content-Type': 'application/json' },
      });

      if (functionError) {
        throw functionError;
      }

      // Edge Function에서 CategorySummary 객체를 직접 반환할 것으로 예상
      if (!data || typeof data.category !== 'string' || !Array.isArray(data.keywords) || typeof data.trendSummary !== 'string') {
        throw new Error('뉴스 요약 결과를 받아오지 못했거나 형식이 올바르지 않습니다.');
      }

      setCategorySummary(data as CategorySummary); // Set the new CategorySummary
    } catch (err: any) {
      console.error('뉴스 요약 중 오류 발생 (전체 오류 객체):', JSON.stringify(err, null, 2));
      setError(err.message || '뉴스 요약 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-0 p-4 w-90 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">뉴스 브리핑</h2>
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          뉴스 카테고리:
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {Object.entries(googleNewsCategories).map(([name, keyword]) => (
            <option key={keyword} value={keyword}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">
          검색어:
        </label>
        <input
          type="text"
          id="searchQuery"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="추가 정보를 위해 검색하실 수 있습니다"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        뉴스 요약하기
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          오류: {error}
        </div>
      )}

      <div className="mt-6 w-80">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          뉴스 요약 결과:
        </h3>
        <div className="bg-gray-50 h-50 p-4 rounded-md border border-gray-200 flex items-center justify-center">
          {loading ? (
            <Typewriter
              options={{
                strings: ['요약 중입니다...', '키워드를 추출하고 있습니다...', '트렌드를 분석하고 있습니다...'],
                autoStart: true,
                loop: true,
                wrapperClassName: 'text-gray-700 text-sm',
                cursorClassName: 'text-gray-700 text-sm'
              }}
            />
          ) : (
            categorySummary && (
              <div>
                <p className="text-gray-700 mt-1 text-sm font-medium">
                  키워드: {categorySummary.keywords.join(', ')}
                </p>
                <p className="text-gray-700 mt-2 text-sm">
                  트렌드: {categorySummary.trendSummary}
                </p>
              </div>
            )
          )}
        </div>
      </div>
      <p className="text-xs text-right">검색 출처 : 구글-네이버 뉴스</p>
    </div>
  );
};

export default NewsBriefing;
