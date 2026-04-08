

import Today from "../Today";
import Weather from "../Weather";


export default function Container() {
    return (
        <section id="Container" className="flex items-center justify-between py-3 gap-11 font-paperlogy glass">
            <Today />
            <Weather />
        </section>
    );
}
