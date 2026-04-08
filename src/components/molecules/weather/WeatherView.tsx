import { WeatherIcon } from "../weather/WeatherIcon";

interface WeatherViewProps {
    temperature: string | null;
    weather: string;
    region: string;
    loading: boolean;
    error: string | null;
}

export default function WeatherView({ temperature, weather, region, loading, error }: WeatherViewProps) {
    const regionParts = region?.split(' ') || [];
    const [city, district, neighborhood] = regionParts;

    return (
        <div id="weather" className="rounded-xl w-66 h-50 p-6 mr-3 flex flex-row items-center justify-between gap-5 bg-background glass-sub">
            {/* 좌측: 아이콘 + 상태 텍스트 */}
            <div className="flex flex-col items-center gap-2">
                <div id="weatherIco" className="rounded-full w-20 h-20 flex justify-center items-center overflow-hidden bg-main">
                    <WeatherIcon />
                </div>
                <div id="state" className="text-xl">{weather}</div>
            </div>

            {/* 우측: 기온 + 지역 정보(동이 상단, 시/구 하단) */}
            <div id="weatherTxt" className="flex flex-col items-start gap-1">
                <div id="temper" className="text-2xl font-bold">{loading ? '로딩중...' : temperature}</div>
                <div id="region" className="flex flex-col">
                    {/* 동 정보 */}
                    <div className="text-xl font-bold">{neighborhood || district || city}</div>
                    {/* 시/구 정보 */}
                    <div className="text-xs text-context/70">
                        {city} {neighborhood ? district : ''}
                    </div>
                </div>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    )
}
