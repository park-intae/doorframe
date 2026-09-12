import React from 'react';
import { useNewsBrief } from '../../../hooks/useNewsBrief';
import NewsBriefInput from '../../molecules/news/NewsBriefInput';
import NewsBriefResult from '../../molecules/news/NewsBriefResult';

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
    <div id="briefContainer" className="p-4.5 rounded-2xl w-full mx-auto font-paperlogy glass h-full overflow-hidden flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-title flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-6 bg-point rounded-full"></span>
        뉴스 브리핑
      </h2>
      <div id="briefContent" className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-hidden">
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
