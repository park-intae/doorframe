import { RootState } from "@/store";
import { getWeatherIconClass, isNightTime } from "@/util/WeatherIconMapper";
import { useSelector } from "react-redux";

export function WeatherIcon() {
    const { weather } = useSelector((state: RootState) => state.weather);

    if (!weather) return null;

    // 디버깅: 실제 받은 날씨 값 확인
    console.log('받은 날씨 데이터:', weather);

    const iconClass = getWeatherIconClass(weather, isNightTime());

    // 디버깅: 생성된 클래스 확인
    console.log('생성된 아이콘 클래스:', iconClass);

    return <div className={iconClass} />
}