

import Today from "../Today";
import Weather from "../Weather";


export default function Container() {
    return (
        <section className="flex items-center container w-200 font-paperlogy font-bold mt-[3vh] h-full">
            <Today />
            <Weather />
        </section>
    );
}
