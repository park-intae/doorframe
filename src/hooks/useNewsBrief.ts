import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CategorySummary } from '../type/news';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 .env 파일에 설정되어야 합니다.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        body: JSON.stringify({ filterCategory: category, searchQuery }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (functionError) throw functionError;

      if (!data || typeof data.category !== 'string' || !Array.isArray(data.keywords) || typeof data.trendSummary !== 'string') {
        throw new Error('뉴스 요약 결과를 받아오지 못했거나 형식이 올바르지 않습니다.');
      }

      setCategorySummary(data as CategorySummary);
    } catch (err: any) {
      console.error('뉴스 요약 중 오류 발생:', err);
      setError(err.message || '뉴스 요약 중 알 수 없는 오류가 발생했습니다.');
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
