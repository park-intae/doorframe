export interface DailyForecast {
  date: string;         // YYYYMMDD
  minTemp: string;      // 최저 기온
  maxTemp: string;      // 최고 기온
  weatherStatus: string; // 날씨 상태 (맑음, 흐림 등)
  precipitation: string; // 강수 확률
}

export interface WeatherHourly {
  time: string;         // HH00
  temp: string;         // 기온
  weather: string;      // 날씨 상태
}

export interface WeatherResponse {
  current: {
    temperature: string;
    weather: string;
    region: string;
  };
  forecast: DailyForecast[]; // 단기(3일) 요약 데이터
  hourly: WeatherHourly[];   // 시각화를 위한 24시간 상세 데이터
}
