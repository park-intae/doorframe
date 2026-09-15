import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  DailyForecast, 
  WeatherHourly, 
  WeatherResponse, 
  WeatherCurrentResponse, 
  WeatherForecastResponse 
} from '@/type/weather';

export interface WeatherState {
  temperature: string | null;
  weather: string;
  region: string;
  forecast: DailyForecast[];
  hourly: WeatherHourly[];
  loading: boolean;
  currentLoading: boolean;
  forecastLoading: boolean;
  error: string | null;
  isFallback: boolean;
  backupSource: string | null;
}

// 1. Fresh 구간 (0 ~ 10분): 완전 신선한 상태, 재요청 불필요
export const FRESH_DURATION = 10 * 60 * 1000;

// 2. Stale-While-Revalidate 허용 최대 수명 (30분):
// 10~30분 사이는 0ms 즉시 표시 + 백그라운드 갱신, 30분 초과 시 프라이버시/보안을 위해 영구 파기(Eviction)
export const STALE_MAX_AGE = 30 * 60 * 1000;

/**
 * 30분 이내의 유효 캐시를 반환하며, 30분이 지난 오래된 데이터는 브라우저에서 즉시 영구 삭제합니다.
 */
export function getValidCachedWeather(): WeatherResponse | null {
  if (typeof window === 'undefined') return null;

  const lastFetch = localStorage.getItem('lastWeatherFetch');
  const cached = localStorage.getItem('cachedWeather');
  if (!lastFetch || !cached) return null;

  const age = Date.now() - parseInt(lastFetch, 10);

  // 30분 초과 시: 브라우저에서 영구 삭제하여 1시간 이상 장기 방치 원천 차단
  if (isNaN(age) || age > STALE_MAX_AGE) {
    localStorage.removeItem('cachedWeather');
    localStorage.removeItem('lastWeatherFetch');
    return null;
  }

  try {
    const parsed = JSON.parse(cached) as WeatherResponse;
    if (parsed && !parsed.isFallback && !parsed.backupSource) {
      return parsed;
    }
  } catch {
    localStorage.removeItem('cachedWeather');
    localStorage.removeItem('lastWeatherFetch');
  }
  return null;
}

/**
 * Frame 0 (0ms) 즉시 렌더링을 위한 초기 상태 생성기
 * 30분 이내 유효 캐시가 존재할 경우 새 탭이 열리자마자 0초 만에 날씨 데이터를 주입합니다.
 */
export const getInitialWeatherState = (): WeatherState => {
  const cached = typeof window !== 'undefined' ? getValidCachedWeather() : null;

  return {
    temperature: cached?.current?.temperature || null,
    weather: cached?.current?.weather || '',
    region: cached?.current?.region || '',
    forecast: cached?.forecast || [],
    hourly: cached?.hourly || [],
    loading: false,
    currentLoading: false,
    forecastLoading: false,
    error: null,
    isFallback: false,
    backupSource: null,
  };
};

const initialState: WeatherState = getInitialWeatherState();

export interface UserCoords {
  latitude: number;
  longitude: number;
  isFallback: boolean;
}

let memoryCoords: UserCoords | null = null;

/**
 * 브라우저 Geolocation 위치 획득
 * 최근 유효 위치(30분 이내)가 있으면 0ms 즉시 반환하여 네트워크 요청을 즉각 발송합니다.
 */
export async function getUserLocation(): Promise<UserCoords> {
  if (memoryCoords) return memoryCoords;

  // 1. 최근 유효 좌표(30분 이내) 캐시가 있으면 0ms 즉각 반환 (센서 대기 시간 0초)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lastUserLocation');
    const savedTime = localStorage.getItem('lastUserLocationTime');
    if (saved && savedTime) {
      const age = Date.now() - parseInt(savedTime, 10);
      if (age <= STALE_MAX_AGE) {
        try {
          const cachedCoords = JSON.parse(saved) as UserCoords;
          if (cachedCoords?.latitude && cachedCoords?.longitude) {
            memoryCoords = cachedCoords;
            return cachedCoords;
          }
        } catch {}
      } else {
        localStorage.removeItem('lastUserLocation');
        localStorage.removeItem('lastUserLocationTime');
      }
    }
  }

  // 2. 캐시가 없는 경우 브라우저 Geolocation 호출 (빠른 타임아웃 3.5초, maximumAge 5분)
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 3500,
        maximumAge: 5 * 60 * 1000,
      });
    });

    const coords: UserCoords = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      isFallback: false,
    };
    memoryCoords = coords;
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastUserLocation', JSON.stringify(coords));
      localStorage.setItem('lastUserLocationTime', Date.now().toString());
    }
    return coords;
  } catch (err) {
    console.warn('Geolocation 위치 획득 실패, 기본 좌표(서울) 사용:', err);
    return {
      latitude: 37.5665,
      longitude: 126.978,
      isFallback: true,
    };
  }
}

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
async function fetchWeatherFallback(
  lat: number,
  lon: number,
  isLocationFallback: boolean,
  type: 'current' | 'forecast' | 'all' = 'all'
): Promise<WeatherResponse> {
  console.warn('[Weather Client] 메인 날씨 서버 점검/응답 실패 -> Open-Meteo 비상 백업망으로 자동 전환합니다.');

  let region = isLocationFallback ? '서울특별시' : '내 위치';
  if (type === 'current' || type === 'all') {
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
  }

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

/**
 * [Track 1] 초고속 현재 실황 조회 Thunk (수백 ms 내 화면 상단 렌더링용)
 */
export const fetchCurrentWeather = createAsyncThunk<
  WeatherCurrentResponse,
  UserCoords | void
>('weather/fetchCurrentWeather', async (coordsArg) => {
  const coords = coordsArg || (await getUserLocation());
  const { latitude, longitude, isFallback } = coords;

  const useLocalEdgeFunction = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
  const baseUrl = useLocalEdgeFunction
    ? 'http://127.0.0.1:54321/functions/v1'
    : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${baseUrl}/weather?lat=${latitude}&lon=${longitude}&type=current`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    });

    if (res.ok) {
      const rawData = await res.json();
      const currentData = rawData.current || {
        temperature: rawData.temperature && rawData.temperature !== 'N/A' ? rawData.temperature : '0',
        weather: rawData.weather || '맑음',
        region: rawData.region || '서울특별시',
      };
      return {
        current: currentData,
        isFallback,
        backupSource: rawData.backupSource || null,
      };
    }
  } catch (edgeErr) {
    console.warn('[Weather Client] 초고속 실황 조회 실패 -> 백업망 전환:', edgeErr);
  }

  try {
    const fallback = await fetchWeatherFallback(latitude, longitude, isFallback, 'current');
    return {
      current: fallback.current,
      isFallback,
      backupSource: fallback.backupSource || 'Open-Meteo',
    };
  } catch (fallbackErr) {
    return {
      current: {
        temperature: '20',
        weather: '맑음',
        region: '서울특별시',
      },
      isFallback: true,
      backupSource: '기본 세팅값',
    };
  }
});

/**
 * [Track 2] 3일 예보 및 시간별 차트 조회 Thunk (백그라운드 비동기 후속 처리용)
 */
export const fetchWeatherForecast = createAsyncThunk<
  WeatherForecastResponse,
  UserCoords | void
>('weather/fetchWeatherForecast', async (coordsArg) => {
  const coords = coordsArg || (await getUserLocation());
  const { latitude, longitude, isFallback } = coords;

  const useLocalEdgeFunction = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
  const baseUrl = useLocalEdgeFunction
    ? 'http://127.0.0.1:54321/functions/v1'
    : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(`${baseUrl}/weather?lat=${latitude}&lon=${longitude}&type=forecast`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    });

    if (res.ok) {
      const rawData = await res.json();
      return {
        forecast: Array.isArray(rawData.forecast) ? rawData.forecast : [],
        hourly: Array.isArray(rawData.hourly) ? rawData.hourly : [],
        isFallback,
        backupSource: rawData.backupSource || null,
      };
    }
  } catch (edgeErr) {
    console.warn('[Weather Client] 단기예보 조회 실패 -> 백업망 전환:', edgeErr);
  }

  try {
    const fallback = await fetchWeatherFallback(latitude, longitude, isFallback, 'forecast');
    return {
      forecast: fallback.forecast,
      hourly: fallback.hourly,
      isFallback,
      backupSource: fallback.backupSource || 'Open-Meteo',
    };
  } catch (fallbackErr) {
    const def = getDefaultFallbackWeather();
    return {
      forecast: def.forecast,
      hourly: def.hourly,
      isFallback: true,
      backupSource: '기본 세팅값',
    };
  }
});

/**
 * [통합 진입점] 30분 SWR 기반 초단기 실황 우선 + 예보 병렬 처리 Thunk
 */
export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async (_, { dispatch }) => {
    const lastFetch = typeof window !== 'undefined' ? localStorage.getItem('lastWeatherFetch') : null;
    const now = Date.now();
    const age = lastFetch ? now - parseInt(lastFetch, 10) : Infinity;

    // 1. [Fresh 구간 (0 ~ 10분)] 완전 신선한 상태면 캐시를 즉시 반환 (재요청 불필요)
    if (age < FRESH_DURATION) {
      const cached = getValidCachedWeather();
      if (cached) {
        return cached;
      }
    }

    // 2. [Stale 구간 (10 ~ 30분) 및 신규 갱신 (Revalidate)]
    // 유효 좌표를 즉시 획득 (최근 30분 캐시 좌표로 0ms 반환)
    const coords = await getUserLocation();

    // 초단기 실황(Track 1)과 단기 예보(Track 2)를 백그라운드에서 병렬 갱신
    const currentPromise = dispatch(fetchCurrentWeather(coords));
    const forecastPromise = dispatch(fetchWeatherForecast(coords));

    const [currentAction, forecastAction] = await Promise.all([
      currentPromise,
      forecastPromise,
    ]);

    const currentPayload = (currentAction as any).payload as WeatherCurrentResponse;
    const forecastPayload = (forecastAction as any).payload as WeatherForecastResponse;

    const fullResponse: WeatherResponse = {
      current: currentPayload?.current || {
        temperature: '20',
        weather: '맑음',
        region: '서울특별시',
      },
      forecast: forecastPayload?.forecast || [],
      hourly: forecastPayload?.hourly || [],
      isFallback: currentPayload?.isFallback || forecastPayload?.isFallback || false,
      backupSource: currentPayload?.backupSource || forecastPayload?.backupSource || null,
    };

    // 정상 데이터만 30분 만료 캐시로 저장
    if (typeof window !== 'undefined' && !fullResponse.isFallback && !fullResponse.backupSource) {
      localStorage.setItem('lastWeatherFetch', Date.now().toString());
      localStorage.setItem('cachedWeather', JSON.stringify(fullResponse));
    }

    return fullResponse;
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    // SWR용 즉각 캐시 복원 리듀서
    restoreCachedWeather: (state, action: PayloadAction<WeatherResponse>) => {
      state.temperature = action.payload.current.temperature;
      state.weather = action.payload.current.weather;
      state.region = action.payload.current.region;
      state.forecast = action.payload.forecast;
      state.hourly = action.payload.hourly;
      state.isFallback = action.payload.isFallback ?? false;
      state.backupSource = action.payload.backupSource ?? null;
      state.loading = false;
      state.currentLoading = false;
      state.forecastLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. fetchCurrentWeather 처리 (초고속 실황)
      .addCase(fetchCurrentWeather.pending, (state) => {
        state.currentLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWeather.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.loading = false; // 실황 데이터가 도착하면 메인 스켈레톤 즉시 해제
        state.temperature = action.payload.current.temperature;
        state.weather = action.payload.current.weather;
        state.region = action.payload.current.region;
        state.isFallback = action.payload.isFallback ?? false;
        if (action.payload.backupSource) {
          state.backupSource = action.payload.backupSource;
        }
      })
      .addCase(fetchCurrentWeather.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload as string;
      })

      // 2. fetchWeatherForecast 처리 (시간별/3일 예보)
      .addCase(fetchWeatherForecast.pending, (state) => {
        state.forecastLoading = true;
      })
      .addCase(fetchWeatherForecast.fulfilled, (state, action) => {
        state.forecastLoading = false;
        state.forecast = action.payload.forecast;
        state.hourly = action.payload.hourly;
        if (action.payload.backupSource) {
          state.backupSource = action.payload.backupSource;
        }
      })
      .addCase(fetchWeatherForecast.rejected, (state) => {
        state.forecastLoading = false;
      })

      // 3. fetchWeather 통합 처리 (하위 호환성 및 SWR 무중단 갱신)
      .addCase(fetchWeather.pending, (state) => {
        // 이미 온전한 기온 데이터(SWR 캐시)가 있는 경우 화면 깜빡임 방지를 위해 loading: true 전환 방지
        if (!state.temperature) {
          state.loading = true;
          state.currentLoading = true;
          state.forecastLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLoading = false;
        state.forecastLoading = false;
        state.temperature = action.payload.current.temperature;
        state.weather = action.payload.current.weather;
        state.region = action.payload.current.region;
        state.forecast = action.payload.forecast;
        state.hourly = action.payload.hourly;
        state.isFallback = action.payload.isFallback ?? false;
        state.backupSource = action.payload.backupSource ?? null;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.currentLoading = false;
        state.forecastLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { restoreCachedWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
