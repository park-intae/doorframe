

import Today from "./Today";
import WeatherContainer from "@/components/organisms/WeatherContainer";


export default function Container() {
    return (
        <section id="Container" className="flex items-center justify-between py-3 gap-11 font-paperlogy glass">
            <Today />
            <WeatherContainer />
        </section>
    );
}
