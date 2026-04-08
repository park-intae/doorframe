import { AppDispatch, RootState } from "@/store"
import { fetchWeather } from "@/store/slice/weatherSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import { WeatherIcon } from "./mainSec/weather/WeatherIcon";

export default function Weather() {
    const dispatch = useDispatch<AppDispatch>();
    const { temperature, weather, region, loading, error } = useSelector(
        (state: RootState) => state.weather
    );

    useEffect(() => {
        dispatch(fetchWeather());
    }, []);

    const regionParts = region?.split(' ') || [];
    const [city, district, neighborhood] = regionParts;

    return (
        <div className="weather rounded-xl w-66 h-50 p-6 mr-3 flex flex-row items-center justify-between gap-5 bg-background glass-sub">
            {/* 좌측: 아이콘 + 상태 텍스트 */}
            <div className="flex flex-col items-center gap-2">
                <div className="weatherIco rounded-full w-20 h-20 flex justify-center items-center overflow-hidden bg-main">
                    <WeatherIcon />
                </div>
                <div className="state text-xl">{weather}</div>
            </div>

            {/* 우측: 기온 + 지역 정보(동이 상단, 시/구 하단) */}
            <div className="weatherTxt flex flex-col items-start gap-1">
                <div className="temper text-2xl font-bold">{loading ? '로딩중...' : temperature}</div>
                <div className="region flex flex-col">
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