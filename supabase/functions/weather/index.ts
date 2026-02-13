import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { ConvertToGrid } from './ConvertToGrid.ts';

// 1. CORS 설정을 위한 헤더 정의
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEATHER_BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

console.log('Weather Function started!');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const WEATHER_API_KEY = Deno.env.get('VITE_PUBLIC_WEATHER_API_KEY');
    const VWORLD_API_KEY = Deno.env.get('VITE_PUBLIC_GEOCODER_API_KEY');

    // 만약 키를 못 가져오면 실행을 멈추도록 체크
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

    // 1. 기상청용 격자 좌표 변환
    const { nx, ny } = ConvertToGrid(latitude, longitude);

    // 2. 기상청 API용 날짜/시간 계산 (KST 기준)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(now.getTime() + kstOffset);

    // 40분 주기에 따른 시간 설정
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

    // 3. 기상청 날씨 API 호출
    const weatherUrl = `${WEATHER_BASE_URL}?serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${BASE_DATE}&base_time=${BASE_TIME}&nx=${nx}&ny=${ny}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const items = weatherData.response?.body?.items?.item || [];
    const T1H = items.find((i: any) => i.category === 'T1H');
    const PTY = items.find((i: any) => i.category === 'PTY');
    const SKY = items.find((i: any) => i.category === 'SKY');

    const PTY_MAP: Record<string, string> = { '0': '없음', '1': '비', '2': '비/눈', '3': '눈', '4': '소나기' };
    const SKY_MAP: Record<string, string> = { '1': '맑음', '3': '구름많음', '4': '흐림' };

    let weatherTextStr =
      PTY?.obsrValue && PTY.obsrValue !== '0'
        ? (PTY_MAP[PTY.obsrValue] ?? '강수')
        : (SKY_MAP[SKY?.obsrValue] ?? '맑음');

    // 4. VWorld 법정동 조회
    const geoUrl = `https://api.vworld.kr/req/address?service=address&request=getAddress&crs=EPSG:4326&point=${longitude},${latitude}&type=both&key=${VWORLD_API_KEY}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    let dong = `(${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
    if (geoData.response?.status === 'OK' && geoData.response.result?.length > 0) {
      const result = geoData.response.result[0];
      dong = result.structure?.level4L || result.text || dong;
    }

    // 5. 최종 데이터 구성
    const result = {
      temperature: T1H?.obsrValue ? T1H.obsrValue + '℃' : 'N/A',
      weather: weatherTextStr,
      region: dong,
    };

    // 응답 반환 (CORS 헤더 포함)
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
