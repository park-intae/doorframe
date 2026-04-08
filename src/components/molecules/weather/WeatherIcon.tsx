import { RootState } from "@/store";
import { getWeatherIconClass, isNightTime } from "@/util/WeatherIconMapper";
import { useSelector } from "react-redux";

export function WeatherIcon() {
    const { weather } = useSelector((state: RootState) => state.weather);

    if (!weather) return null;

    const iconClass = getWeatherIconClass(weather, isNightTime());

    return <div className={iconClass} />
}