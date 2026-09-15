import 'supabase';
import { ConvertToGrid } from './ConvertToGrid.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

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
 * 기상청 하늘상태(SKY) 및 강수형태(PTY) 코드를 텍스트로 변환
 */
function getWeatherStatus(sky: string, pty: string): string {
  const ptyNum = parseInt(pty || '0');
  if (ptyNum > 0) {
    if (ptyNum === 1 || ptyNum === 5) return '비';
    if (ptyNum === 2 || ptyNum === 6) return '비/눈';
    if (ptyNum === 3 || ptyNum === 7) return '눈';
    if (ptyNum === 4) return '소나기';
    return '비';
  }
  const skyNum = parseInt(sky || '1');
  if (skyNum === 1) return '맑음';
  if (skyNum === 3) return '구름많음';
  if (skyNum === 4) return '흐림';
  return '맑음';
}

/**
 * Open-Meteo 글로벌 기상망 백업 데이터 생성 함수 (type별 분기 지원)
 */
async function fetchOpenMeteoBackup(lat: number, lon: number, region: string, type: string = 'all') {
  const meteoRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=3`
  );
  if (!meteoRes.ok) throw new Error('Open-Meteo 백업 서버 응답 실패');

  const meteo = await meteoRes.json();
  const curTemp = Math.round(meteo.current?.temperature_2m ?? 0).toString();
  const curWeather = getWmoStatus(meteo.current?.weather_code ?? 0);

  if (type === 'current') {
    return {
      current: {
        temperature: curTemp,
        weather: curWeather,
        region: region || '서울특별시',
      },
      backupSource: 'Open-Meteo',
    };
  }

  const hourly = (meteo.hourly?.time || []).slice(0, 24).map((t: string, idx: number) => ({
    time: t.slice(11, 16),
    temp: Math.round(meteo.hourly.temperature_2m[idx]).toString(),
    weather: getWmoStatus(meteo.hourly.weather_code[idx]),
  }));

  const forecast = (meteo.daily?.time || []).slice(0, 3).map((d: string, idx: number) => ({
    date: d.replace(/-/g, ''),
    minTemp: Math.round(meteo.daily.temperature_2m_min[idx]).toString(),
    maxTemp: Math.round(meteo.daily.temperature_2m_max[idx]).toString(),
    weatherStatus: getWmoStatus(meteo.daily.weather_code[idx]),
    precipitation: (meteo.daily.precipitation_probability_max?.[idx] ?? 0) + '%',
  }));

  if (type === 'forecast') {
    return {
      forecast,
      hourly,
      backupSource: 'Open-Meteo',
    };
  }

  return {
    current: {
      temperature: curTemp,
      weather: curWeather,
      region: region || '서울특별시',
    },
    forecast,
    hourly,
    backupSource: 'Open-Meteo',
  };
}

// 1. VWorld 역지오코딩 인메모리 캐시 (좌표 소수점 2자리 기준 약 1.1km 반경, 1시간 TTL)
const regionCache = new Map<string, { region: string; timestamp: number }>();
const REGION_CACHE_TTL = 60 * 60 * 1000;

// 2. 기상청 초단기실황 인메모리 캐시 (격자 nx, ny + 기준시각 기준, 10분 TTL)
const kmaCurrentCache = new Map<string, { data: { temperature: string; weather: string }; timestamp: number }>();
const KMA_CURRENT_TTL = 10 * 60 * 1000;

// 3. 기상청 단기예보 인메모리 캐시 (격자 nx, ny + 기준시각 기준, 20분 TTL)
const kmaForecastCache = new Map<string, { data: any; timestamp: number }>();
const KMA_FORECAST_TTL = 20 * 60 * 1000;

/**
 * VWorld 및 BigDataCloud를 활용한 역지오코딩 (인메모리 캐시 및 비동기 격리)
 */
async function fetchRegion(lat: number, lon: number, vworldKey: string): Promise<string> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = regionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < REGION_CACHE_TTL) {
    console.log('[Weather Backend] ⚡ VWorld 인메모리 캐시 히트 (0ms):', cached.region);
    return cached.region;
  }

  let region = '알 수 없는 지역';
  if (vworldKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const geoRes = await fetch(
        `https://api.vworld.kr/req/address?service=address&request=getAddress&crs=EPSG:4326&point=${lon},${lat}&key=${vworldKey}&type=both`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      if (geoRes.ok) {
        const geoText = await geoRes.text();
        const geoData = JSON.parse(geoText);
        if (geoData.response?.status === 'OK' && geoData.response.result?.length > 0) {
          const addr = geoData.response.result[0].structure;
          region = `${addr.level1 || ''} ${addr.level2 || ''}`.trim() || addr.level4L || '알 수 없는 지역';
        }
      }
    } catch (geoErr) {
      console.warn('[Weather Backend] VWorld 지오코딩 실패 또는 타임아웃:', geoErr);
    }
  }

  // VWorld 실패 시 무료 역지오코딩 백업
  if (region === '알 수 없는 지역') {
    try {
      const bgRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`
      );
      if (bgRes.ok) {
        const bgData = await bgRes.json();
        const p1 = bgData.principalSubdivision || '';
        const p2 = bgData.locality || bgData.city || '';
        if (p1 || p2) region = `${p1} ${p2}`.trim();
      }
    } catch (e) {
      console.warn('[Weather Backend] BigDataCloud 지오코딩 실패:', e);
    }
  }

  const finalRegion = region === '알 수 없는 지역' ? '서울특별시' : region;
  regionCache.set(cacheKey, { region: finalRegion, timestamp: Date.now() });
  return finalRegion;
}

/**
 * 기상청 초단기실황(getUltraSrtNcst) 및 초단기예보(getUltraSrtFcst)를 이용한 초고속 현재 실황 조회
 */
async function fetchCurrentKma(
  encodedWeatherKey: string,
  nx: number,
  ny: number,
  kstTime: Date
): Promise<{ temperature: string; weather: string } | null> {
  const today = kstTime.toISOString().slice(0, 10).replace(/-/g, '');
  const currentHour = kstTime.getHours();
  const currentMinute = kstTime.getMinutes();

  // 1. 초단기실황 (getUltraSrtNcst): 매시 40분 발표
  let baseHourForNcst = currentHour;
  let baseDateForNcst = today;
  if (currentMinute < 45) {
    if (currentHour === 0) {
      const yesterday = new Date(kstTime.getTime() - 24 * 60 * 60 * 1000);
      baseDateForNcst = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
      baseHourForNcst = 23;
    } else {
      baseHourForNcst -= 1;
    }
  }
  const formattedNcstTime = baseHourForNcst.toString().padStart(2, '0') + '00';

  // 인메모리 캐시 확인 (10분 유효)
  const cacheKey = `${nx},${ny},${formattedNcstTime}`;
  const cached = kmaCurrentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < KMA_CURRENT_TTL) {
    console.log('[Weather Backend] ⚡ KMA 초단기실황 인메모리 캐시 히트 (0ms):', cached.data);
    return cached.data;
  }

  // 2. 초단기예보 (getUltraSrtFcst): 매시 30분 발표 (하늘상태 SKY 확보용)
  let baseHourForFcst = currentHour;
  let baseDateForFcst = today;
  if (currentMinute < 45) {
    if (currentHour === 0) {
      const yesterday = new Date(kstTime.getTime() - 24 * 60 * 60 * 1000);
      baseDateForFcst = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
      baseHourForFcst = 23;
    } else {
      baseHourForFcst -= 1;
    }
  }
  const formattedFcstTime = baseHourForFcst.toString().padStart(2, '0') + '30';

  try {
    const [ncstRes, fcstRes] = await Promise.all([
      fetch(
        `${BASE_URL}/getUltraSrtNcst?serviceKey=${encodedWeatherKey}&dataType=JSON&base_date=${baseDateForNcst}&base_time=${formattedNcstTime}&nx=${nx}&ny=${ny}&numOfRows=10`
      ),
      fetch(
        `${BASE_URL}/getUltraSrtFcst?serviceKey=${encodedWeatherKey}&dataType=JSON&base_date=${baseDateForFcst}&base_time=${formattedFcstTime}&nx=${nx}&ny=${ny}&numOfRows=60`
      ),
    ]);

    let ncstItems: any[] = [];
    let fcstItems: any[] = [];

    if (ncstRes.ok) {
      try {
        const ncstData = await ncstRes.json();
        ncstItems = ncstData.response?.body?.items?.item || [];
      } catch {}
    }
    if (fcstRes.ok) {
      try {
        const fcstData = await fcstRes.json();
        fcstItems = fcstData.response?.body?.items?.item || [];
      } catch {}
    }

    if (ncstItems.length === 0 && fcstItems.length === 0) {
      return null;
    }

    // 기온 추출: 실황 T1H 우선, 없으면 초단기예보 첫 번째 T1H
    let temp = ncstItems.find((i: any) => i.category === 'T1H')?.obsrValue;
    if (!temp || temp === '0') {
      temp = fcstItems.find((i: any) => i.category === 'T1H')?.fcstValue || '0';
    }

    // 날씨 상태 추출: 실황 PTY(강수) 우선 + 초단기예보 SKY(하늘상태)
    const ptyObsr = ncstItems.find((i: any) => i.category === 'PTY')?.obsrValue;
    const ptyFcst = fcstItems.find((i: any) => i.category === 'PTY')?.fcstValue;
    const skyFcst = fcstItems.find((i: any) => i.category === 'SKY')?.fcstValue;

    const weather = getWeatherStatus(skyFcst || '1', ptyObsr !== undefined ? ptyObsr : ptyFcst || '0');

    const result = {
      temperature: Math.round(Number(temp)).toString(),
      weather,
    };
    kmaCurrentCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn('[Weather Backend] 초단기 실황 KMA 조회 실패:', err);
    return null;
  }
}

/**
 * 기상청 단기예보(getVilageFcst, 1000행)를 이용한 시간별 차트 및 3일 예보 가공
 */
async function fetchForecastKma(
  encodedWeatherKey: string,
  nx: number,
  ny: number,
  kstTime: Date,
  todayStr: string
): Promise<{ forecast: any[]; hourly: any[]; firstWeather: string; firstTemp: string } | null> {
  const today = kstTime.toISOString().slice(0, 10).replace(/-/g, '');
  const currentHour = kstTime.getHours();
  const currentMinute = kstTime.getMinutes();

  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = baseTimes.filter((h) => h <= currentHour).pop() || 23;
  let baseDate = today;
  if (currentHour < 2 || (currentHour === 2 && currentMinute < 15)) {
    const yesterday = new Date(kstTime.getTime() - 24 * 60 * 60 * 1000);
    baseDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
    baseHour = 23;
  }
  const formattedBaseTime = baseHour.toString().padStart(2, '0') + '00';

  // 인메모리 캐시 확인 (20분 유효)
  const cacheKey = `${nx},${ny},${formattedBaseTime}`;
  const cached = kmaForecastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < KMA_FORECAST_TTL) {
    console.log('[Weather Backend] ⚡ KMA 단기예보 인메모리 캐시 히트 (0ms)');
    return cached.data;
  }

  try {
    const forecastRes = await fetch(
      `${BASE_URL}/getVilageFcst?serviceKey=${encodedWeatherKey}&dataType=JSON&base_date=${baseDate}&base_time=${formattedBaseTime}&nx=${nx}&ny=${ny}&numOfRows=1000`
    );

    if (!forecastRes.ok) return null;
    const forecastText = await forecastRes.text();
    const forecastData = JSON.parse(forecastText);
    const forecastItems = forecastData.response?.body?.items?.item || [];

    if (forecastItems.length === 0) return null;

    const nowHourStr = currentHour.toString().padStart(2, '0') + '00';

    // Hourly 데이터 가공 (24시간)
    const hourly = forecastItems
      .filter((i: any) => i.category === 'TMP')
      .filter((i: any) => {
        if (i.fcstDate > todayStr) return true;
        if (i.fcstDate === todayStr && i.fcstTime >= nowHourStr) return true;
        return false;
      })
      .slice(0, 24)
      .map((i: any) => {
        const time = i.fcstTime;
        const temp = i.fcstValue;
        const skyItem = forecastItems.find(
          (f: any) => f.fcstDate === i.fcstDate && f.fcstTime === time && f.category === 'SKY'
        );
        const ptyItem = forecastItems.find(
          (f: any) => f.fcstDate === i.fcstDate && f.fcstTime === time && f.category === 'PTY'
        );
        return {
          time: time.slice(0, 2) + ':00',
          temp: Math.round(Number(temp)).toString(),
          weather: getWeatherStatus(skyItem?.fcstValue, ptyItem?.fcstValue),
        };
      });

    // Daily 예보 가공 (3일)
    const dailyMap = new Map();
    forecastItems.forEach((i: any) => {
      const date = i.fcstDate;
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, temps: [], skies: [], pties: [], pops: [] });
      }
      const day = dailyMap.get(date);
      if (i.category === 'TMP') day.temps.push(Number(i.fcstValue));
      if (i.category === 'SKY') day.skies.push(i.fcstValue);
      if (i.category === 'PTY') day.pties.push(i.fcstValue);
      if (i.category === 'POP') day.pops.push(i.fcstValue);
    });

    const sortedDates = Array.from(dailyMap.keys()).sort();
    const forecast = sortedDates
      .map((date) => {
        const day = dailyMap.get(date);
        const avgSky = day.skies[Math.floor(day.skies.length / 2)] || '1';
        const avgPty = day.pties[Math.floor(day.pties.length / 2)] || '0';
        const maxPop = day.pops.length > 0 ? Math.max(...day.pops.map(Number)).toString() : '0';
        return {
          date,
          minTemp: day.temps.length > 0 ? Math.min(...day.temps).toString() : '0',
          maxTemp: day.temps.length > 0 ? Math.max(...day.temps).toString() : '0',
          weatherStatus: getWeatherStatus(avgSky, avgPty),
          precipitation: maxPop + '%',
        };
      })
      .slice(0, 3);

    const result = {
      forecast,
      hourly,
      firstWeather: hourly[0]?.weather || '맑음',
      firstTemp: hourly[0]?.temp || '0',
    };
    kmaForecastCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn('[Weather Backend] KMA 단기예보 처리 실패:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat')) || 37.5665;
  const lon = Number(url.searchParams.get('lon')) || 126.978;
  const queryType = url.searchParams.get('type') || 'all'; // 'current' | 'forecast' | 'all'

  try {
    const WEATHER_API_KEY = Deno.env.get('VITE_PUBLIC_WEATHER_API_KEY') || '';
    let VWORLD_API_KEY = Deno.env.get('VITE_PUBLIC_GEOCODER_API_KEY') || '';
    if (VWORLD_API_KEY.includes('=')) {
      VWORLD_API_KEY = VWORLD_API_KEY.split('=').pop()?.trim() || '';
    }

    const { nx, ny } = ConvertToGrid(lat, lon);

    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(now.getTime() + kstOffset);
    const todayStr =
      kstTime.getFullYear().toString() +
      (kstTime.getMonth() + 1).toString().padStart(2, '0') +
      kstTime.getDate().toString().padStart(2, '0');

    const encodedWeatherKey = WEATHER_API_KEY
      ? encodeURIComponent(decodeURIComponent(WEATHER_API_KEY))
      : '';

    // ==========================================
    // [분기 1] type=current : 초고속 실황 전용
    // ==========================================
    if (queryType === 'current') {
      console.log('[Weather Backend] ⚡ [Track 1] type=current 초고속 실황 조회 시작');

      // VWorld 역지오코딩과 기상청 초단기실황/예보를 완전 병렬로 실행
      const [region, currentKma] = await Promise.all([
        fetchRegion(lat, lon, VWORLD_API_KEY),
        encodedWeatherKey ? fetchCurrentKma(encodedWeatherKey, nx, ny, kstTime) : Promise.resolve(null),
      ]);

      if (currentKma) {
        const response = {
          current: {
            temperature: currentKma.temperature,
            weather: currentKma.weather,
            region,
          },
          backupSource: null,
        };
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // KMA 실패 시 Open-Meteo 백업망 실황 즉시 반환
      console.warn('[Weather Backend] KMA 초단기실황 실패 -> Open-Meteo 실황 백업 가동');
      const backupCurrent = await fetchOpenMeteoBackup(lat, lon, region, 'current');
      return new Response(JSON.stringify(backupCurrent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ==========================================
    // [분기 2] type=forecast : 3일 예보 및 시간별 차트 전용
    // ==========================================
    if (queryType === 'forecast') {
      console.log('[Weather Backend] 🌱 [Track 2] type=forecast 단기 예보 조회 시작');

      let forecastResult = encodedWeatherKey
        ? await fetchForecastKma(encodedWeatherKey, nx, ny, kstTime, todayStr)
        : null;

      if (forecastResult) {
        const response = {
          forecast: forecastResult.forecast,
          hourly: forecastResult.hourly,
          backupSource: null,
        };
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // KMA 단기예보 실패 시 Open-Meteo 예보 백업 반환
      console.warn('[Weather Backend] KMA 단기예보 실패 -> Open-Meteo 예보 백업 가동');
      const backupForecast = await fetchOpenMeteoBackup(lat, lon, '', 'forecast');
      return new Response(JSON.stringify(backupForecast), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ==========================================
    // [분기 3] type=all (기존 단일 호출 호환성 유지)
    // ==========================================
    console.log('[Weather Backend] 📦 type=all 전체 날씨 통합 조회');
    const [region, currentKma, forecastResult] = await Promise.all([
      fetchRegion(lat, lon, VWORLD_API_KEY),
      encodedWeatherKey ? fetchCurrentKma(encodedWeatherKey, nx, ny, kstTime) : Promise.resolve(null),
      encodedWeatherKey ? fetchForecastKma(encodedWeatherKey, nx, ny, kstTime, todayStr) : Promise.resolve(null),
    ]);

    if (forecastResult) {
      const response = {
        current: {
          temperature: currentKma?.temperature || forecastResult.firstTemp || '0',
          weather: currentKma?.weather || forecastResult.firstWeather || '맑음',
          region,
        },
        forecast: forecastResult.forecast,
        hourly: forecastResult.hourly,
        backupSource: null,
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 전체 실패 시 Open-Meteo 전체 백업
    const fallbackResponse = await fetchOpenMeteoBackup(lat, lon, region, 'all');
    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    console.error('[Weather Backend] 💥 처리 중 예외 발생 -> Open-Meteo 안전망 가동:', e);
    try {
      const fallbackResponse = await fetchOpenMeteoBackup(lat, lon, '서울특별시', queryType);
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (finalErr: any) {
      return new Response(JSON.stringify({ error: finalErr?.message || e.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }
});
