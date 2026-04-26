import 'supabase';
import { ConvertToGrid } from './ConvertToGrid.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const WEATHER_API_KEY = Deno.env.get('VITE_PUBLIC_WEATHER_API_KEY');
    const VWORLD_API_KEY = Deno.env.get('VITE_PUBLIC_GEOCODER_API_KEY');
    if (!WEATHER_API_KEY || !VWORLD_API_KEY) throw new Error('API Key 누락');

    const url = new URL(req.url);
    const lat = Number(url.searchParams.get('lat'));
    const lon = Number(url.searchParams.get('lon'));
    if (!lat || !lon) throw new Error('위치 정보(lat, lon)가 필요합니다.');

    const { nx, ny } = ConvertToGrid(lat, lon);

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

    // 2. API 호출 (numOfRows를 1000으로 늘려 3일치 데이터를 확실히 확보)
    const [currentRes, forecastRes, geoRes] = await Promise.all([
      fetch(`${BASE_URL}/getUltraSrtNcst?serviceKey=${WEATHER_API_KEY}&dataType=JSON&base_date=${baseDateForNcst}&base_time=${formattedNcstTime}&nx=${nx}&ny=${ny}`),
      fetch(`${BASE_URL}/getVilageFcst?serviceKey=${WEATHER_API_KEY}&dataType=JSON&base_date=${baseDate}&base_time=${formattedBaseTime}&nx=${nx}&ny=${ny}&numOfRows=1000`),
      fetch(`https://api.vworld.kr/req/address?service=address&request=getAddress&point=${lon},${lat}&key=${VWORLD_API_KEY}&type=both`)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    const geoData = await geoRes.json();

    // 3. 지역 정보
    let region = '알 수 없는 지역';
    if (geoData.response?.status === 'OK') {
      const addr = geoData.response.result[0].structure;
      region = `${addr.level1} ${addr.level2}`;
    }

    const forecastItems = forecastData.response?.body?.items?.item || [];
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

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders });
  }
});
