

import Today from "../Today";
import Weather from "../Weather";


export default function Container() {
    return (
        <section className="container flex items-center justify-between p-3 gap-11 font-paperlogy smDT:mt-5 mdDT:mt-8 lgDT:mt-10 glass">
            <Today />
            <Weather />
        </section>
    );
}
