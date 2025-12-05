'use client';

import Today from "./subcomponents/Today";
import Weather from "./subcomponents/Weather";


export default function Container() {
    return (
        <section className="container font-paperlogy font-bold">
            <Today />
            <Weather />
        </section>
    );
}
