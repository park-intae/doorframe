const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
// api 키 활용 인코딩
const encodedKey = encodeURIComponent(API_KEY);

const BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

interface Weather {
  pageNo: string;
  numOfRows: number;
  dataType: string;
  base_date: number;
  base_time: number;
  nx: number;
  ny: number;
}
