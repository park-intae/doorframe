import { useState } from 'react';
import { supabase } from '../config/supabase';
import { CategorySummary } from '../type/news';

export const useNewsBrief = () => {
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setCategorySummary(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('news-briefing', {
        body: { filterCategory: category, searchQuery },
      });

      if (functionError) throw functionError;

      if (!data || typeof data.category !== 'string' || !Array.isArray(data.keywords) || typeof data.trendSummary !== 'string') {
        throw new Error('뉴스 요약 결과를 받아오지 못했거나 형식이 올바르지 않습니다.');
      }

      setCategorySummary(data as CategorySummary);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '뉴스 요약 중 알 수 없는 오류가 발생했습니다.';
      console.error('뉴스 요약 중 오류 발생:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    categorySummary,
    loading,
    error,
    handleSummarize,
  };
};
