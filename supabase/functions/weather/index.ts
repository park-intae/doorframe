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
    if (ptyNum === 1) return '비';
    if (ptyNum === 2) return '비/눈';
    if (ptyNum === 3) return '눈';
    if (ptyNum === 4) return '소나기';
  }
  const skyNum = parseInt(sky || '1');
  if (skyNum === 1) return '맑음';
  if (skyNum === 3) return '구름많음';
  if (skyNum === 4) return '흐림';
  return '알 수 없음';
}

/**
 * Open-Meteo 글로벌 기상망 백업 데이터 생성 함수
 */
async function fetchOpenMeteoBackup(lat: number, lon: number, region: string) {
  const meteoRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=3`
  );
  if (!meteoRes.ok) throw new Error('Open-Meteo 백업 서버 응답 실패');

  const meteo = await meteoRes.json();
  const curTemp = Math.round(meteo.current?.temperature_2m ?? 0).toString();
  const curWeather = getWmoStatus(meteo.current?.weather_code ?? 0);

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

  return {
    current: {
      temperature: curTemp,
      weather: curWeather,
      region,
    },
    forecast,
    hourly,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const WEATHER_API_KEY = Deno.env.get('VITE_PUBLIC_WEATHER_API_KEY') || '';
    let VWORLD_API_KEY = Deno.env.get('VITE_PUBLIC_GEOCODER_API_KEY') || '';
    // 만약 키 값에 prefix(예: '발급받은_VWORLD_API_KEY=...')가 포함되어 있다면 순수 키만 추출
    if (VWORLD_API_KEY.includes('=')) {
      VWORLD_API_KEY = VWORLD_API_KEY.split('=').pop()?.trim() || '';
    }

    const url = new URL(req.url);
    const lat = Number(url.searchParams.get('lat')) || 37.5665;
    const lon = Number(url.searchParams.get('lon')) || 126.9780;

    const { nx, ny } = ConvertToGrid(lat, lon);

    console.log('[Weather Backend] 📍 수신된 위치 좌표:', { lat, lon, nx, ny });
    console.log('[Weather Backend] 🔑 API 키 설정 상태:', {
      weatherKey: WEATHER_API_KEY ? `${WEATHER_API_KEY.slice(0, 5)}...` : '없음',
      vworldKey: VWORLD_API_KEY ? `${VWORLD_API_KEY.slice(0, 5)}...` : '없음',
    });

    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(now.getTime() + kstOffset);
    const today = kstTime.toISOString().slice(0, 10).replace(/-/g, '');
    
    const currentHour = kstTime.getHours();
    const currentMinute = kstTime.getMinutes();
    const todayStr = kstTime.getFullYear().toString() + 
                     (kstTime.getMonth() + 1).toString().padStart(2, '0') + 
                     kstTime.getDate().toString().padStart(2, '0');

    // 1. Base Time 계산
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

    const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let baseHour = baseTimes.filter(h => h <= currentHour).pop() || 23;
    let baseDate = today;
    if (currentHour < 2 || (currentHour === 2 && currentMinute < 10)) {
      const yesterday = new Date(kstTime.getTime() - 24 * 60 * 60 * 1000);
      baseDate = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
      baseHour = 23;
    }
    const formattedBaseTime = baseHour.toString().padStart(2, '0') + '00';

    console.log('[Weather Backend] ⏰ 기상청 조회 기준:', {
      ncstDate: baseDateForNcst,
      ncstTime: formattedNcstTime,
      baseDate,
      baseTime: formattedBaseTime,
      nx,
      ny
    });

    // 2. 외부 API 개별 격리 호출 (네트워크 단절 및 차단 대비)
    let currentData: any = {};
    let forecastData: any = {};
    let geoData: any = {};

    // 2-1. VWorld 역지오코딩 (네트워크 장애 및 Connection Reset에 대비한 격리)
    if (VWORLD_API_KEY) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const geoRes = await fetch(
          `https://api.vworld.kr/req/address?service=address&request=getAddress&crs=EPSG:4326&point=${lon},${lat}&key=${VWORLD_API_KEY}&type=both`,
          { signal: controller.signal }
        );
        clearTimeout(timer);
        if (geoRes.ok) {
          const geoText = await geoRes.text();
          try { geoData = JSON.parse(geoText); } catch {}
        }
      } catch (geoErr) {
        console.warn('[Weather Backend] VWorld 지오코딩 실패 또는 차단:', geoErr);
      }
    }

    // 2-2. 기상청 API 호출 (점검 또는 장애 시 격리)
    if (WEATHER_API_KEY) {
      try {
        const encodedWeatherKey = encodeURIComponent(decodeURIComponent(WEATHER_API_KEY));
        const [currentRes, forecastRes] = await Promise.all([
          fetch(`${BASE_URL}/getUltraSrtNcst?serviceKey=${encodedWeatherKey}&dataType=JSON&base_date=${baseDateForNcst}&base_time=${formattedNcstTime}&nx=${nx}&ny=${ny}`),
          fetch(`${BASE_URL}/getVilageFcst?serviceKey=${encodedWeatherKey}&dataType=JSON&base_date=${baseDate}&base_time=${formattedBaseTime}&nx=${nx}&ny=${ny}&numOfRows=1000`)
        ]);

        if (currentRes.ok) {
          const currentText = await currentRes.text();
          try { currentData = JSON.parse(currentText); } catch {}
        }
        if (forecastRes.ok) {
          const forecastText = await forecastRes.text();
          try { forecastData = JSON.parse(forecastText); } catch {}
        }
      } catch (kmaErr) {
        console.warn('[Weather Backend] 기상청 API 호출 실패:', kmaErr);
      }
    }

    // 3. 지역 정보 결정
    let region = '알 수 없는 지역';
    if (geoData.response?.status === 'OK' && geoData.response.result?.length > 0) {
      const addr = geoData.response.result[0].structure;
      region = `${addr.level1 || ''} ${addr.level2 || ''}`.trim() || addr.level4L || '알 수 없는 지역';
    }

    // VWorld 실패 시 무료 역지오코딩 백업
    if (region === '알 수 없는 지역') {
      try {
        const bgRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`);
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
    console.log('[Weather Backend] 🏷️ 최종 파싱된 지역명(region):', region);

    const forecastItems = forecastData.response?.body?.items?.item || [];

    // 4. 기상청 데이터 누락 시 Open-Meteo 실시간 기상 데이터로 자동 백업
    if (forecastItems.length === 0) {
      console.log('[Weather Backend] ⚠️ 기상청 데이터 누락 -> Open-Meteo 실시간 기상 데이터로 자동 백업 연동');
      const fallbackResponse = await fetchOpenMeteoBackup(lat, lon, region);
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const nowHourStr = currentHour.toString().padStart(2, '0') + '00';

    // 4. Hourly 데이터 가공
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
        const skyItem = forecastItems.find((f: any) => f.fcstDate === i.fcstDate && f.fcstTime === time && f.category === 'SKY');
        const ptyItem = forecastItems.find((f: any) => f.fcstDate === i.fcstDate && f.fcstTime === time && f.category === 'PTY');
        return {
          time: time.slice(0, 2) + ':00',
          temp,
          weather: getWeatherStatus(skyItem?.fcstValue, ptyItem?.fcstValue)
        };
      });

    // 5. 현재 기온 결정
    let finalTemp = hourly.length > 0 ? hourly[0].temp : '0';
    if (finalTemp === '0') {
      const currentItems = currentData.response?.body?.items?.item || [];
      finalTemp = currentItems.find((i: any) => i.category === 'T1H')?.obsrValue || '0';
    }

    // 6. Daily 예보 가공 (오늘, 내일, 모레 정확히 추출)
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
    const forecast = sortedDates.map(date => {
      const day = dailyMap.get(date);
      const avgSky = day.skies[Math.floor(day.skies.length / 2)] || '1';
      const avgPty = day.pties[Math.floor(day.pties.length / 2)] || '0';
      const maxPop = day.pops.length > 0 ? Math.max(...day.pops.map(Number)).toString() : '0';
      return {
        date,
        minTemp: day.temps.length > 0 ? Math.min(...day.temps).toString() : '0',
        maxTemp: day.temps.length > 0 ? Math.max(...day.temps).toString() : '0',
        weatherStatus: getWeatherStatus(avgSky, avgPty),
        precipitation: maxPop + '%'
      };
    }).slice(0, 3);

    const response = {
      current: {
        temperature: finalTemp,
        weather: hourly[0]?.weather || '맑음',
        region
      },
      forecast,
      hourly
    };

    console.log('[Weather Backend] 📤 클라이언트로 반환하는 최종 데이터:', JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    console.error('[Weather Backend] 💥 처리 중 예외 발생 -> Open-Meteo 최후 안전망 가동:', e);
    try {
      const url = new URL(req.url);
      const lat = Number(url.searchParams.get('lat')) || 37.5665;
      const lon = Number(url.searchParams.get('lon')) || 126.9780;
      const fallbackResponse = await fetchOpenMeteoBackup(lat, lon, '서울특별시');
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (finalErr: any) {
      return new Response(JSON.stringify({ error: finalErr?.message || e.message }), { status: 500, headers: corsHeaders });
    }
  }
});
