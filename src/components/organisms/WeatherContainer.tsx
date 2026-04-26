import { AppDispatch, RootState } from "@/store";
import { fetchWeather } from "@/store/slice/weatherSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WeatherView from "../molecules/weather/WeatherView";

// 기상청(KMA) 단기예보 Open API 기반 데이터 사용
export default function WeatherContainer() {
    const dispatch = useDispatch<AppDispatch>();
    const weatherData = useSelector((state: RootState) => state.weather);

    useEffect(() => {
        dispatch(fetchWeather());
    }, [dispatch]);

    return <WeatherView {...weatherData} />;
}
