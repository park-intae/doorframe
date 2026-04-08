import { AppDispatch, RootState } from "@/store";
import { fetchWeather } from "@/store/slice/weatherSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WeatherView from "../molecules/weather/WeatherView";

export default function WeatherContainer() {
    const dispatch = useDispatch<AppDispatch>();
    const weatherData = useSelector((state: RootState) => state.weather);

    useEffect(() => {
        dispatch(fetchWeather());
    }, [dispatch]);

    return <WeatherView {...weatherData} />;
}
