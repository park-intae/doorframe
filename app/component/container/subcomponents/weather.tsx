import { AppDispatch, RootState } from "app/store"
import { fetchWeather } from "app/store/slice/weatherSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"

export default function Weather() {
    const dispatch = useDispatch<AppDispatch>();
    const { temperature, weather, region, loading, error } = useSelector(
        (state: RootState) => state.weather
    );

    useEffect(() => {
        dispatch(fetchWeather());
    }, []);

    return (
        <div className="weather">
            <div className="weatherIco"></div>
            <div className="weatehrTxt">
                <div className="temper">{loading ? '로딩중...' : temperature}</div>
                <div className="state">{weather}</div>
                <div className="region">{region}</div>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    )
}