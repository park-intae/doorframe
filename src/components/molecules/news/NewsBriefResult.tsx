import React from 'react';
import Typewriter from 'typewriter-effect';
import { CategorySummary } from '../../../type/news';

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
    <div id='briefResCon' className="flex-1 flex flex-col min-h-40 mdDT:w-full">
      <div id='briefRes' className="glass-sub flex-1 p-4 flex flex-col justify-start relative overflow-y-auto scrollbar-thin max-h-38" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-context/60 font-paperlogy">
            <Typewriter
              options={{
                strings: ['최신 뉴스를 가져오는 중...', '키워드를 추출하고 있습니다...', '트렌드를 분석하고 있습니다...', '요약 결과를 작성 중입니다...'],
                autoStart: true,
                loop: true,
                deleteSpeed: 50,
                delay: 50,
                wrapperClassName: 'text-point text-sm font-medium font-paperlogy',
                cursorClassName: 'text-point text-sm',
              }}
            />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 italic font-paperlogy">
            {error}
          </div>
        ) : categorySummary ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 font-paperlogy">
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
          <div className="flex flex-col items-center justify-center h-full text-context/40 italic font-paperlogy">
            <p className="text-sm">카테고리를 선택하고</p>
            <p className="text-sm">요약하기 버튼을 눌러주세요</p>
          </div>
        )}
      </div>
      <p className="text-[10px] text-right text-slate-600 mt-2 font-paperlogy">출처: 구글 & 네이버 뉴스</p>
    </div>
  );
};

export default NewsBriefResult;
