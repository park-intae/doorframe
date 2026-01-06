

import Today from "../Today";
import Weather from "../Weather";


export default function Container() {
    return (
        <section className="flex flex-col container font-paperlogy font-bold mt-[3vh] h-100">
            <Today />
            <Weather />
        </section>
    );
}
