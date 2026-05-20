import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No authorization header" }), { status: 401 });
  }

  try {
    // 1. YouTube Data API 호출 (최근 활동/재생 기록 조회)
    // scope: https://www.googleapis.com/auth/youtube.readonly
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=10",
      {
        headers: {
          Authorization: authHeader, // 클라이언트에서 전달받은 Supabase 토큰 사용
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // 2. 응답 데이터 중 영상 ID만 추출하여 반환
    const videoIds = data.items
      .filter((item: any) => item.contentDetails?.upload || item.contentDetails?.playlistItem)
      .map((item: any) => item.contentDetails?.upload?.videoId || item.contentDetails?.playlistItem?.resourceId?.videoId)
      .filter(Boolean);

    return new Response(JSON.stringify({ playlist: videoIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
    });
  }
});
