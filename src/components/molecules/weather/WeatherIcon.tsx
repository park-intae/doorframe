import { RootState } from "@/store";
import { getWeatherIconClass, isNightTime } from "@/util/WeatherIconMapper";
import { useSelector } from "react-redux";

interface WeatherIconProps {
    weather?: string;
    isNight?: boolean;
    className?: string;
}

export function WeatherIcon({ weather: propWeather, isNight, className }: WeatherIconProps = {}) {
    const reduxWeather = useSelector((state: RootState) => state.weather.weather);
    const targetWeather = propWeather || reduxWeather;

    if (!targetWeather) return null;

    const night = isNight !== undefined ? isNight : isNightTime();
    const iconClass = getWeatherIconClass(targetWeather, night);

    return (
        <div className={className || "flex items-center justify-center w-full h-full p-2"}>
            <div 
                className={`${iconClass} dark:invert`} 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }} 
            />
        </div>
    );
}