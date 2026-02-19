import React from 'react';
import { useNewsBrief } from '../../../../hooks/useNewsBrief';
import NewsBriefInput from './newsBrief/NewsBriefInput';
import NewsBriefResult from './newsBrief/NewsBriefResult';

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
    <div className="bg-main/30 backdrop-blur-sm p-5 rounded-2xl shadow-lg w-full max-w-[604px] mt-7 border border-main font-paperlogy transition-all duration-300">
      <h2 className="text-xl font-bold mb-4 text-title flex items-center gap-2">
        <span className="w-2 h-6 bg-point rounded-full"></span>
        뉴스 브리핑
      </h2>

      <div className="flex flex-col smDT:flex-row mdDT:flex-col gap-5">
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
    </div>
  );
};

export default NewsBriefing;
