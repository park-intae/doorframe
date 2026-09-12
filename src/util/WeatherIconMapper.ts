/**
 * 날씨 상태를 Weather Underground 아이콘 클래스로 매핑
 * @param weather - 날씨 상태 문자열 (예: "Clear", "Clouds", "Rain" 등)
 * @param isNight - 밤 시간 여부 (선택사항)
 * @returns Weather Underground CSS 클래스 문자열
 */

export const getWeatherIconClass = (weather: string, isNight: boolean = false): string => {
  const baseClass = 'wu wu-64 wu-black';
  const nightClass = isNight ? 'wu-night' : '';

  const weatherLower = weather.toLowerCase();

  const weatherMap: { [key: string]: string } = {
    맑음: 'wu-clear',
    구름많음: 'wu-mostlycloudy',
    흐림: 'wu-cloudy',
    비: 'wu-rain',
    '비/눈': 'wu-sleet',
    눈: 'wu-snow',
    소나기: 'wu-rain',
    빗방울: 'wu-chancerain',
    '빗방울/눈날림': 'wu-chancesleet',
    눈날림: 'wu-flurries',
    천둥번개: 'wu-tstorms',
    뇌우: 'wu-tstorms',
    안개: 'wu-fog',
    황사: 'wu-hazy',
    알수없음: 'wu-unknown',
    clear: 'wu-clear',
    sunny: 'wu-sunny',
    clouds: 'wu-cloudy',
    cloudy: 'wu-cloudy',
    'partly cloudy': 'wu-partlycloudy',
    'mostly cloudy': 'wu-mostlycloudy',
    rain: 'wu-rain',
    snow: 'wu-snow',
    sleet: 'wu-sleet',
    thunderstorm: 'wu-tstorms',
    fog: 'wu-fog',
    haze: 'wu-hazy',
  };
  // 날씨 클래스
  const weatherClass = weatherMap[weather] || weatherMap[weatherLower] || 'wu-unknown';

  return `${baseClass} ${nightClass} ${weatherClass}`.trim();
};

/**
 * 현재 시간이 밤인지 확인
 * @param hour - 현재 시간 (0-23)
 * @returns 밤 시간 여부
 */

export const isNightTime = (hour: number = new Date().getHours()): boolean => {
  return hour < 6 || hour >= 18;
};

/* 날씨 한글 이름 반환 */
export const getWeatherKoreanName = (weather: string): string => {
  const koreanMap: { [key: string]: string } = {
    clear: '맑음',
    sunny: '맑음',
    clouds: '흐림',
    cloudy: '흐림',
    'partly cloudy': '구름 조금',
    'mostly cloudy': '대체로 흐림',
    rain: '비',
    drizzle: '이슬비',
    snow: '눈',
    sleet: '진눈깨비',
    thunderstorm: '뇌우',
    fog: '안개',
    mist: '안개',
    haze: '실안개',
    unknown: '알 수 없음',
  };

  return koreanMap[weather.toLowerCase()] || weather;
};
