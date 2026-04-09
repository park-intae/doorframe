import { describe, it, expect } from 'vitest';

describe("뉴스 브리핑 파싱 로직 테스트", () => {
  it("Gemini 응답에서 키워드와 트렌드를 올바르게 추출해야 함", () => {
    const rawOutput = `
      키워드: [AI, 기술, 발전, 연구, 미래]
      트렌드: [AI 기술이 다양한 산업 분야에서 빠르게 도입되며 생산성을 높이고 있습니다.]
    `;

    const keywordMatch = rawOutput.match(/키워드: \[(.*?)\]/);
    const trendMatch = rawOutput.match(/트렌드: \[(.*?)\]/);

    const keywords = keywordMatch ? keywordMatch[1].split(',').map(kw => kw.trim()) : [];
    const trendSummary = trendMatch ? trendMatch[1].trim() : "";

    expect(keywords).toEqual(["AI", "기술", "발전", "연구", "미래"]);
    expect(trendSummary).toBe("AI 기술이 다양한 산업 분야에서 빠르게 도입되며 생산성을 높이고 있습니다.");
  });

  it("잘못된 형식의 응답일 경우 빈 배열과 기본값을 반환해야 함", () => {
    const rawOutput = "잘못된 응답 형식";

    const keywordMatch = rawOutput.match(/키워드: \[(.*?)\]/);
    const trendMatch = rawOutput.match(/트렌드: \[(.*?)\]/);

    const keywords = keywordMatch ? keywordMatch[1].split(',').map(kw => kw.trim()) : [];
    const trendSummary = trendMatch ? trendMatch[1].trim() : "요약된 트렌드를 찾을 수 없습니다.";

    expect(keywords).toEqual([]);
    expect(trendSummary).toBe("요약된 트렌드를 찾을 수 없습니다.");
  });
});
