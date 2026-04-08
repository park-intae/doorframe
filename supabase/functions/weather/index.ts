import 'supabase';
import { ConvertToGrid } from './ConvertToGrid.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherItem {
  category: string;
  obsrValue: string;
  baseDate: string;
  baseTime: string;
  nx: number;
  ny: number;
}

const WEATHER_BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const WEATHER_API_KEY = Deno.env.get('VITE_PUBLIC_WEATHER_API_KEY');
    const VWORLD_API_KEY = Deno.env.get('VITE_PUBLIC_GEOCODER_API_KEY');

    if (!WEATHER_API_KEY || !VWORLD_API_KEY) {
      return new Response(JSON.stringify({ error: '환경 변수(API Key)를 찾을 수 없습니다.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    if (!lat || !lon) throw new Error('lat, lon 파라미터가 필요합니다.');

    const latitude = Number(lat);
    const longitude = Number(lon);

    const { nx, ny } = ConvertToGrid(latitude, longitude);

    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(now.getTime() + kstOffset);

    let dateToRequest = new Date(kstTime);
    if (kstTime.getUTCMinutes() < 40) {
      dateToRequest = new Date(kstTime.getTime() - 60 * 60 * 1000);
    }

    const BASE_DATE = [
      dateToRequest.getUTCFullYear(),
      String(dateToRequest.getUTCMonth() + 1).padStart(2, '0'),
      String(dateToRequest.getUTCDate()).padStart(2, '0'),
    ].join('');
    const BASE_TIME = String(dateToRequest.getUTCHours()).padStart(2, '0') + '00';

    const weatherUrl = `${WEATHER_BASE_URL}?serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${BASE_DATE}&base_time=${BASE_TIME}&nx=${nx}&ny=${ny}`;
    const geoUrl = `https://api.vworld.kr/req/address?service=address&request=getAddress&crs=EPSG:4326&point=${longitude},${latitude}&type=parcel&key=${VWORLD_API_KEY}`;

    try {
      const weatherRes = await fetch(weatherUrl);
      const geoRes = await fetch(geoUrl);
      
      console.log('Weather API Status:', weatherRes.status);
      if (!weatherRes.ok) {
        console.error('Weather API Error Body:', await weatherRes.text());
      }

      const weatherResult = { temperature: 'N/A', weather: '데이터 없음' };
      if (weatherRes && weatherRes.ok) {
        const weatherData = await weatherRes.json();
        const items: WeatherItem[] = weatherData.response?.body?.items?.item || [];
        if (items.length > 0) {
          const T1H = items.find((i: WeatherItem) => i.category === 'T1H');
          const PTY = items.find((i: WeatherItem) => i.category === 'PTY');
          const SKY = items.find((i: WeatherItem) => i.category === 'SKY');

          const PTY_MAP: Record<string, string> = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '4': '소나기' };
          const SKY_MAP: Record<string, string> = { '1': '맑음', '3': '구름많음', '4': '흐림' };

          weatherResult.temperature = T1H?.obsrValue ? T1H.obsrValue + '℃' : 'N/A';
          weatherResult.weather = PTY?.obsrValue && PTY.obsrValue !== '0'
            ? (PTY_MAP[PTY.obsrValue] ?? '강수')
            : (SKY?.obsrValue ? (SKY_MAP[SKY.obsrValue] ?? '맑음') : '맑음');
        }
      }

      let regionName = `(${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
      if (geoRes && geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.response?.status === 'OK' && geoData.response.result?.length > 0) {
          const result = geoData.response.result[0];
          const { level1, level2, level3, level4L } = result.structure;
          const parts = [level1, level2, level3, level4L].filter(Boolean);
          if (parts.length > 0) regionName = parts.join(' ');
        }
      }

      const finalResult = {
        ...weatherResult,
        region: regionName,
      };

      return new Response(JSON.stringify(finalResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (fetchError) {
      throw fetchError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
