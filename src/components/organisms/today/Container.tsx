

import Today from "./Today";
import WeatherContainer from "@/components/organisms/WeatherContainer";


export default function Container() {
    return (
        <section id="Container" className="flex flex-col items-center gap-3.5 w-full font-paperlogy">
            <Today />
            <WeatherContainer />
        </section>
    );
}
