const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
// api 키 활용 전 인코딩
const encodedKey = encodeURIComponent(API_KEY);

const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
