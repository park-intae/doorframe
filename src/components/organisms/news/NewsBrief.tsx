import React from 'react';
import { useNewsBrief } from '../../../hooks/useNewsBrief';
import NewsBriefInput from '../../molecules/news/NewsBriefInput';
import NewsBriefResult from '../../molecules/news/NewsBriefResult';
import Carousel from '../carousel';

const NewsBriefing: React.FC = () => {
  const {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    categorySummary,
    loading,
    error,
    handleSummarize,
  } = useNewsBrief();

  return (
    <div id="briefContainer" className="p-5 rounded-2xl w-full max-w-140 border border-main font-paperlogy glass">
      <h2 className="text-xl font-bold mb-4 text-title flex items-center gap-2">
        <span className="w-2 h-6 bg-point rounded-full"></span>
        뉴스 브리핑
      </h2>
      <div id="briefContent" className="h-[300px]">
        <Carousel>
            <div className="flex flex-col mdDT:flex-row lgDT:flex-col gap-5 h-full">
                <NewsBriefInput
                    category={category}
                    setCategory={setCategory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleSummarize={handleSummarize}
                    loading={loading}
                />
                <NewsBriefResult
                    loading={loading}
                    error={error}
                    categorySummary={categorySummary}
                />
            </div>
            {/* 다른 컨텐츠 슬라이드 예시 */}
            <div className="flex items-center justify-center h-full text-context font-paperlogy">
                여기에 다른 위젯을 추가하세요.
            </div>
        </Carousel>
      </div>
    </div>
  );
};

export default NewsBriefing;
