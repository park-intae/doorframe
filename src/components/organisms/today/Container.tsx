

import Today from "./Today";
import WeatherContainer from "@/components/organisms/WeatherContainer";


export default function Container() {
    return (
        <section id="Container" className="flex flex-row smDT:flex-col mdDT:flex-row items-center justify-between py-3 gap-11 smDT:gap-4 mdDT:gap-11 font-paperlogy glass w-fit smDT:w-full">
            <Today />
            <WeatherContainer />
        </section>
    );
}
