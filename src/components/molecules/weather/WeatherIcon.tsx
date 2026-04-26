import { RootState } from "@/store";
import { getWeatherIconClass, isNightTime } from "@/util/WeatherIconMapper";
import { useSelector } from "react-redux";

export function WeatherIcon() {
    const { weather } = useSelector((state: RootState) => state.weather);

    if (!weather) return null;

    const iconClass = getWeatherIconClass(weather, isNightTime());

    return (
        <div className="flex items-center justify-center w-full h-full p-2">
            <div 
                className={iconClass} 
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