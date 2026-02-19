

import Today from "../Today";
import Weather from "../Weather";


export default function Container() {
    return (
        <section className="flex items-center container gap-11 w-200 font-paperlogy font-bold smDT:mt-5 mdDT:mt-8 lgDT:mt-10 h-full">
            <Today />
            <Weather />
        </section>
    );
}
