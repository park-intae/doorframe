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
    <div className="bg-main/30 backdrop-blur-sm p-5 rounded-2xl shadow-lg w-full max-w-[604px] mt-7 border border-main font-paperlogy transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 text-title flex items-center gap-2">
        <span className="w-2 h-6 bg-point rounded-full"></span>
        뉴스 브리핑
      </h2>

      <div className="flex flex-col smDT:flex-row mdDT:flex-col gap-5">
        {/* 입력 및 설정 영역 */}
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

        {/* 결과 출력 영역 */}
        <div className="flex-1 flex flex-col min-h-[160px] mdDT:w-full">
          <div className="bg-background/50 flex-1 p-4 rounded-xl border border-main flex flex-col justify-center relative overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Typewriter
                  options={{
                    strings: ['최신 뉴스를 가져오는 중...', '키워드를 추출하고 있습니다...', '트렌드를 분석하고 있습니다...', '요약 결과를 작성 중입니다...'],
                    autoStart: true,
                    loop: true,
                    wrapperClassName: 'text-point text-sm font-medium',
                    cursorClassName: 'text-point text-sm'
                  }}
                />
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 italic">
                {error}
              </div>
            ) : categorySummary ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-3">
                  <span className="text-[10px] bg-point/10 text-point px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1 inline-block">Keywords</span>
                  <p className="text-title text-sm font-bold leading-relaxed">
                    {categorySummary.keywords.join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] bg-important/10 text-important px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1 inline-block">Trend Summary</span>
                  <p className="text-context text-sm leading-relaxed text-justify break-keep">
                    {categorySummary.trendSummary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-context/40 italic">
                <p className="text-sm">카테고리를 선택하고</p>
                <p className="text-sm">요약하기 버튼을 눌러주세요</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-right text-context mt-2 opacity-60">출처: 구글 & 네이버 뉴스</p>
        </div>
      </div>
    </div>
  );
};

export default NewsBriefing;
