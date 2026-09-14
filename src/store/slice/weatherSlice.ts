import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DailyForecast, WeatherHourly, WeatherResponse } from '@/type/weather';

interface WeatherState {
  temperature: string | null;
  weather: string;
  region: string;
  forecast: DailyForecast[];
  hourly: WeatherHourly[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  backupSource: string | null;
}

const initialState: WeatherState = {
  temperature: null,
  weather: '',
  region: '',
  forecast: [],
  hourly: [],
  loading: false,
  error: null,
  isFallback: false,
  backupSource: null,
};

const CACHE_DURATION = 10 * 60 * 1000;

/**
 * Open-Meteo WMO 날씨 코드를 한글 텍스트로 변환
 */
function getWmoStatus(code: number): string {
  if (code === 0) return '맑음';
  if (code === 1 || code === 2) return '구름많음';
  if (code === 3) return '흐림';
  if (code >= 45 && code <= 48) return '안개';
  if (code >= 51 && code <= 67) return '비';
  if (code >= 71 && code <= 77) return '눈';
  if (code >= 80 && code <= 82) return '소나기';
  if (code >= 85 && code <= 86) return '눈';
  if (code >= 95 && code <= 99) return '뇌우';
  return '맑음';
}

/**
 * 메인 날씨 서버(Edge Function) 오류 또는 점검 시 브라우저에서 직접 Open-Meteo 기상망을 호출하는 비상 백업망
 */
async function fetchWeatherFallback(lat: number, lon: number, isLocationFallback: boolean): Promise<WeatherResponse> {
  console.warn('[Weather Client] 메인 날씨 서버 점검/응답 실패 -> Open-Meteo 비상 백업망으로 자동 전환합니다.');

  // 1. 지역명 역지오코딩 시도 (BigDataCloud)
  let region = isLocationFallback ? '서울특별시' : '내 위치';
  try {
    const bgRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
    );
    if (bgRes.ok) {
      const bgData = await bgRes.json();
      const p1 = bgData.principalSubdivision || '';
      const district = (bgData.localityInfo?.administrative || []).find(
        (a: any) => a.adminLevel === 6 || (a.name && (a.name.endsWith('구') || a.name.endsWith('군')))
      )?.name || '';
      const locality = bgData.locality || bgData.city || '';

      const parts = [p1, district, locality].filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));
      if (uniqueParts.length > 0) region = uniqueParts.join(' ');
    }
  } catch (e) {
    console.warn('[Weather Client] BigDataCloud 지오코딩 실패, 기본 지역명 사용:', e);
  }

  // 2. Open-Meteo 글로벌 기상망 호출
  const meteoRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=3`
  );

  if (!meteoRes.ok) {
    throw new Error('날씨 서버 응답 실패');
  }

  const meteo = await meteoRes.json();
  const curTemp = Math.round(meteo.current?.temperature_2m ?? 0).toString();
  const curWeather = getWmoStatus(meteo.current?.weather_code ?? 0);

  const hourly: WeatherHourly[] = (meteo.hourly?.time || []).slice(0, 24).map((t: string, idx: number) => ({
    time: t.slice(11, 16),
    temp: Math.round(meteo.hourly.temperature_2m[idx]).toString(),
    weather: getWmoStatus(meteo.hourly.weather_code[idx]),
  }));

  const forecast: DailyForecast[] = (meteo.daily?.time || []).slice(0, 3).map((d: string, idx: number) => ({
    date: d.replace(/-/g, ''),
    minTemp: Math.round(meteo.daily.temperature_2m_min[idx]).toString(),
    maxTemp: Math.round(meteo.daily.temperature_2m_max[idx]).toString(),
    weatherStatus: getWmoStatus(meteo.daily.weather_code[idx]),
    precipitation: (meteo.daily.precipitation_probability_max?.[idx] ?? 0) + '%',
  }));

  return {
    current: {
      temperature: curTemp,
      weather: curWeather,
      region,
    },
    forecast,
    hourly,
    isFallback: isLocationFallback,
    backupSource: 'Open-Meteo',
  };
}

/**
 * 3단계: 메인망과 백업망 모두 실패 시 표시할 안전 기본 세팅값
 */
function getDefaultFallbackWeather(): WeatherResponse {
  return {
    current: {
      temperature: '20',
      weather: '맑음',
      region: '서울특별시',
    },
    forecast: [
      { date: '오늘', minTemp: '16', maxTemp: '24', weatherStatus: '맑음', precipitation: '0%' },
      { date: '내일', minTemp: '17', maxTemp: '25', weatherStatus: '구름많음', precipitation: '10%' },
      { date: '모레', minTemp: '15', maxTemp: '23', weatherStatus: '맑음', precipitation: '0%' },
    ],
    hourly: Array.from({ length: 24 }).map((_, idx) => ({
      time: `${idx.toString().padStart(2, '0')}:00`,
      temp: '20',
      weather: '맑음',
    })),
    isFallback: true,
    backupSource: '기본 세팅값',
  };
}

export const fetchWeather = createAsyncThunk('weather/fetchWeather', async (_, { rejectWithValue }) => {
  try {
    // 클라이언트 사이드 캐싱 확인
    if (typeof window !== 'undefined') {
      const lastFetch = localStorage.getItem('lastWeatherFetch');
      const cached = localStorage.getItem('cachedWeather');
      const now = Date.now();

      if (lastFetch && cached && now - parseInt(lastFetch) < CACHE_DURATION) {
        const parsed = JSON.parse(cached) as WeatherResponse;
        // 기본 위치(폴백) 캐시가 아닐 때만 유효한 캐시로 재사용
        if (!parsed.isFallback && !parsed.backupSource) {
          return parsed;
        }
      }
    }

    // 1. 사용자 위치 정보 획득 (실패 시 서울 기본 좌표로 폴백)
    let latitude = 37.5665;
    let longitude = 126.9780;
    let isLocationFallback = false;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 10000 }),
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch (geoErr) {
      isLocationFallback = true;
      console.warn('위치 권한을 얻지 못해 기본 좌표(서울)를 사용합니다.', geoErr);
    }

    // TODO: Lighthouse 성능 검사 및 로컬 테스트용 (추후 삭제 및 원복 예정)
    const useLocalEdgeFunction = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
    const baseUrl = useLocalEdgeFunction
      ? 'http://127.0.0.1:54321/functions/v1' 
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    let data: WeatherResponse | null = null;

    // [1단계] 메인 기상청 날씨 API(Edge Function) 호출 시도
    try {
      const res = await fetch(`${baseUrl}/weather?lat=${latitude}&lon=${longitude}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
      });

      if (res.ok) {
        const rawData = await res.json();
        console.log('[Weather Redux Debug] Raw Data from Server:', rawData);

        // 하위 호환성: 신규 스키마(current)와 구버전 플랫 스키마 모두 지원
        data = {
          current: rawData.current || {
            temperature: rawData.temperature && rawData.temperature !== 'N/A' ? rawData.temperature : '0',
            weather: rawData.weather || '맑음',
            region: rawData.region || '서울특별시',
          },
          forecast: Array.isArray(rawData.forecast) ? rawData.forecast : [],
          hourly: Array.isArray(rawData.hourly) ? rawData.hourly : [],
          isFallback: isLocationFallback,
          backupSource: rawData.backupSource || null,
        };
      } else {
        console.warn(`[Weather] 메인 Edge Function 응답 비정상 (HTTP ${res.status}) -> 2단계 백업망 가동`);
      }
    } catch (edgeErr) {
      console.warn('[Weather] 메인 Edge Function 연결 실패 -> 2단계 백업망 가동:', edgeErr);
    }

    // [2단계] 메인 서버 실패 시 브라우저 직접 비상 백업망(Open-Meteo) 호출
    if (!data) {
      try {
        data = await fetchWeatherFallback(latitude, longitude, isLocationFallback);
      } catch (fallbackErr) {
        // [3단계] 백업망마저 실패 시 이전 캐시 복원 또는 안전 기본 세팅값 제공
        console.warn('[Weather Client] 비상 백업망 호출 실패, 이전 캐시 또는 기본 세팅값 복원:', fallbackErr);
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('cachedWeather');
          if (cached) {
            try {
              const staleData = JSON.parse(cached) as WeatherResponse;
              console.log('[Weather Client] 이전 캐시 복원 성공:', staleData);
              return {
                ...staleData,
                isFallback: true,
                backupSource: '오프라인 캐시',
              };
            } catch {}
          }
        }
        return getDefaultFallbackWeather();
      }
    }

    // 4. 정상 위치 데이터만 캐싱 (기본 위치 폴백일 때는 캐시를 삭제하여 다음 탭에서 재시도)
    if (typeof window !== 'undefined') {
      if (!data.isFallback && !data.backupSource) {
        localStorage.setItem('lastWeatherFetch', Date.now().toString());
        localStorage.setItem('cachedWeather', JSON.stringify(data));
      } else {
        localStorage.removeItem('cachedWeather');
        localStorage.removeItem('lastWeatherFetch');
      }
    }
    return data;
  } catch (err: unknown) {
    console.error('날씨 데이터 처리 최종 안전망 가동 (기본 세팅값 반환):', err);
    return getDefaultFallbackWeather();
  }
});

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        console.log('[Weather Redux Debug] Fulfilling with payload:', action.payload);
        state.loading = false;
        state.temperature = action.payload.current.temperature;
        state.weather = action.payload.current.weather;
        state.region = action.payload.current.region;
        state.forecast = action.payload.forecast;
        state.hourly = action.payload.hourly;
        state.isFallback = action.payload.isFallback ?? false;
        state.backupSource = action.payload.backupSource ?? null;
        console.log('[Weather Redux Debug] Updated State Temperature:', state.temperature, 'BackupSource:', state.backupSource);
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default weatherSlice.reducer;
