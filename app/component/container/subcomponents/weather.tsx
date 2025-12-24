import { AppDispatch, RootState } from "app/store"
import { fetchWeather } from "app/store/slice/weatherSlice";
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

    return (
        <div className="weather rounded-xl my-4 mx-auto min-w-50 min-h-58 flex flex-row items-center justify-between gap-5 p-6 bg-background">
            <div className="weatherIco rounded-full w-20 h-20 flex justify-center items-center overflow-hidden bg-white">
                <WeatherIcon />
            </div>
            <div className="weatehrTxt flex flex-col gap-3">
                <div className="temper text-2xl">{loading ? '로딩중...' : temperature}</div>
                <div className="state text-xl">{weather}</div>
                <div className="region text-lg">{region}</div>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    )
}