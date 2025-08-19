import { NextResponse } from 'next/server';
import { convertToGrid } from 'app/util/convertToGrid';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
const VWORLD_API_KEY = process.env.NEXT_PUBLIC_GEOCODER_API_KEY || '';

const WEATHER_BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return NextResponse.json({ error: 'lat, lon 파라미터 필요' }, { status: 400 });
    }

    const latitude = Number(lat);
    const longitude = Number(lon);

    // 격자 좌표 변환
    const { nx, ny } = convertToGrid(latitude, longitude);

    // 날짜/시간 계산
    const now = new Date();
    let hour = now.getHours();
    let date = new Date(now);
    if (hour === 0) {
      date.setDate(date.getDate() - 1);
      hour = 23;
    } else {
      hour -= 1;
    }
    const BASE_DATE = date.toISOString().slice(0, 10).replace(/-/g, '');
    const BASE_TIME = hour.toString().padStart(2, '0') + '00';

    // 1) 기상청 날씨 API 호출
    const weatherUrl = `${WEATHER_BASE_URL}?${new URLSearchParams({
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: BASE_DATE,
      base_time: BASE_TIME,
      nx: nx.toString(),
      ny: ny.toString(),
      serviceKey: decodeURIComponent(WEATHER_API_KEY),
    }).toString()}`;

    const weatherRes = await fetch(weatherUrl);
    const weatherText = await weatherRes.text();
    const weatherData = JSON.parse(weatherText);

    const items = weatherData.response.body.items.item;
    const T1H = items.find((i: any) => i.category === 'T1H');
    const PTY = items.find((i: any) => i.category === 'PTY');
    const SKY = items.find((i: any) => i.category === 'SKY');

    const PTY_MAP: Record<string, string> = {
      '0': '없음',
      '1': '비',
      '2': '비/눈',
      '3': '눈',
      '4': '소나기',
    };
    const SKY_MAP: Record<string, string> = {
      '1': '맑음',
      '3': '구름많음',
      '4': '흐림',
    };

    let weatherTextStr = '';
    if (PTY?.obsrValue && PTY.obsrValue !== '0') {
      weatherTextStr = PTY_MAP[PTY.obsrValue] ?? '강수';
    } else if (SKY?.obsrValue) {
      weatherTextStr = SKY_MAP[SKY?.obsrValue] ?? '맑음';
    } else {
      weatherTextStr = '맑음';
    }

    // 2) VWorld 법정동 조회
    const geoUrl = `https://api.vworld.kr/req/address?${new URLSearchParams({
      service: 'address',
      request: 'getAddress',
      crs: 'EPSG:4326',
      point: `${longitude},${latitude}`,
      type: 'both',
      key: VWORLD_API_KEY,
    }).toString()}`;

    console.log('[VWorld API URL]', geoUrl);

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    let dong = `(${latitude.toFixed(2)}, ${longitude.toFixed(2)})`; // fallback
    if (geoData.response?.status === 'OK' && geoData.response.result?.length > 0) {
      const result = geoData.response.result[0];
      const structure = result.structure;
      dong =
        structure?.level4L || // 법정동 (고덕동)
        result?.text || // 전체 주소 문자열
        dong; // fallback
    }

    // 최종 반환
    return NextResponse.json({
      temperature: T1H?.obsrValue ? T1H.obsrValue + '℃' : 'N/A',
      weather: weatherTextStr,
      region: dong,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || '서버 에러' }, { status: 500 });
  }
}
