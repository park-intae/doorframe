import { supabase } from '../config/supabase';

/**
 * YouTube 관련 API 호출을 위한 클라이언트 서비스
 */
export const youtubeService = {
  /**
   * Edge Function을 통해 YouTube 데이터 요청
   * @param endpoint 호출할 YouTube API 경로
   */
  async fetchYoutubeData(endpoint: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("인증 세션이 존재하지 않습니다.");
    }

    const response = await supabase.functions.invoke('youtube-proxy', {
      body: { endpoint },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  /**
   * 사용자의 최근 재생 기록 가져오기
   */
  async getRecentPlayHistory() {
    // API 호출 경로 구성 (YouTube Data API v3 history 등)
    return await this.fetchYoutubeData('history');
  }
};
