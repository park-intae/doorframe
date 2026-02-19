// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "supabase";
import { parseFeed } from "rss";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. CORS 설정을 위한 헤더 정의
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 2. 요청 본문 인터페이스 정의
interface RequestBody {
  articleCount?: number;
  filterCategory?: string; // 카테고리 필터링을 위한 선택적 필드
  searchQuery?: string; // 사용자가 입력한 검색어를 위한 선택적 필드
}

// 3. 카테고리별 뉴스 요약 응답 인터페이스 정의
interface CategorySummary {
  category: string;
  keywords: string[];
  trendSummary: string;
}

// 4. Gemini를 사용하여 기사 내용을 요약하는 함수
// 4. Gemini를 사용하여 기사 내용을 요약하는 함수 (전체 뉴스 요약 및 키워드 추출)
async function summarizeWithGemini(
  filterCategory: string | undefined, // 필터링된 카테고리 (선택 사항)
  combinedArticleContent: string,      // 통합된 기사 내용
): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
    throw new Error("서버에 GEMINI_API_KEY가 설정되지 않았습니다. 관리자에게 문의하세요.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // 모델 폴백 리스트 정의
  const models = [
    { name: 'gemini-pro-latest', description: '기본' },
    { name: 'gemini-flash-latest', description: '열화' },
    { name: 'gemini-flash-lite-latest', description: '최대 열화' }
  ];

  const categoryContext = filterCategory ? `카테고리: ${filterCategory}\n` : "";
  const prompt = `아래 여러 뉴스 기사의 내용 확인 요청.
${categoryContext} 기사들에서 가장 중요한 키워드 5가지(쉼표로 구분), 전반적인 트렌드를 2문장 이내, 한국어로 요약. 트렌드 내용은 반드시 존대 사용.
출력 형식은 반드시 다음을 따를 것, '키워드'와 '트렌드' 모두 대괄호로 감싸서 응답 할 것을 요구.
키워드: [키워드1, 키워드2, 키워드3, 키워드4, 키워드5]
트렌드: [전반적인 트렌드 요약 짧게 1문장]

--- 기사 내용 ---
${combinedArticleContent}`;

  let lastError: unknown = null;

  for (const modelInfo of models) {
    try {
      console.log(`[뉴스 요약] ${modelInfo.description}(${modelInfo.name}) 모델으로 시도 중...`);
      const model = genAI.getGenerativeModel({ model: modelInfo.name });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(`[뉴스 요약] ${modelInfo.name} 모델 성공`);
      return text.trim();
    } catch (error) {
      console.error(`[뉴스 요약] ${modelInfo.name} 모델 실패:`, error);
      lastError = error;
      // 다음 모델로 계속 진행
    }
  }

  // 모든 모델이 실패한 경우
  console.error("[뉴스 요약] 모든 모델 호출에 실패했습니다.");
  throw new Error("모든 뉴스 요약 모델 호출에 실패했습니다.", { cause: lastError });
}

console.log("뉴스 브리핑 함수 시작!");

Deno.serve(async (req) => {
  // CORS Preflight 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { articleCount = 10, filterCategory, searchQuery }: RequestBody = await req.json();

    // 검색어들을 조합하여 쿼리 문자열 생성
    const queryParts = ['site:naver.com'];
    if (filterCategory && filterCategory !== '뉴스') { // '전체 뉴스'는 특정 키워드를 추가하지 않음
      queryParts.push(filterCategory);
    }
    if (searchQuery) {
      queryParts.push(searchQuery);
    }

    const encodedQuery = encodeURIComponent(queryParts.join(' '));
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=ko&gl=KR&ceid=KR:ko`;

    console.log("Constructed RSS URL:", rssUrl); // 디버깅을 위한 로그

    // 5. RSS 피드 가져오기 및 파싱
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`RSS 피드를 가져오는 데 실패했습니다: ${response.statusText}`);
    }
    const xml = await response.text();
    const feed = await parseFeed(xml);

    const articlesToProcess = feed.entries.slice(0, articleCount);

    const combinedArticleContent = articlesToProcess.map(entry => {
      const title = entry.title?.value || "";
      const content = entry.description?.value || entry.content?.value || "";
      return `제목: ${title}\n내용: ${content}`;
    }).join("\n\n---\n\n");

    if (!combinedArticleContent.trim()) {
      const emptySummary: CategorySummary = {
        category: filterCategory || "전체 뉴스",
        keywords: ["해당 없음"],
        trendSummary: "요약할 뉴스가 없습니다.",
      };
      return new Response(JSON.stringify(emptySummary), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const rawGeminiOutput = await summarizeWithGemini(filterCategory || "전체 뉴스", combinedArticleContent);

    // Gemini 출력 파싱, CategorySummary 객체 생성
    let keywords: string[] = [];
    let trendSummary: string = "요약된 트렌드를 찾을 수 없습니다.";

    const keywordMatch = rawGeminiOutput.match(/키워드: \[(.*?)\]/);
    if (keywordMatch && keywordMatch[1]) {
      keywords = keywordMatch[1].split(',').map(kw => kw.trim());
    }

    const trendMatch = rawGeminiOutput.match(/트렌드: \[(.*?)\]/);
    if (trendMatch && trendMatch[1]) {
      trendSummary = trendMatch[1].trim();
    }

    const categorySummary: CategorySummary = {
      category: filterCategory || "전체 뉴스",
      keywords: keywords,
      trendSummary: trendSummary,
    };

    // 응답 반환 (CORS 헤더 포함)
    return new Response(JSON.stringify(categorySummary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("함수 실행 중 오류 발생:", error);
    let errorMessage = "알 수 없는 오류가 발생했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("함수에서 500 오류 응답 반환 중:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
