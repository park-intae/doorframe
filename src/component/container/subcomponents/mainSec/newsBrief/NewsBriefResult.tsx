import React from 'react';
import Typewriter from 'typewriter-effect';
import { CategorySummary } from '../../../../../type/news';

interface NewsBriefResultProps {
  loading: boolean;
  error: string | null;
  categorySummary: CategorySummary | null;
}

const NewsBriefResult: React.FC<NewsBriefResultProps> = ({
  loading,
  error,
  categorySummary,
}) => {
  return (
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
  );
};

export default NewsBriefResult;
