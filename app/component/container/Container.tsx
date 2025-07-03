'use client';

import Today from "./subcomponents/today";
import Weather from "./subcomponents/Weather";


export default function Container() {
    return (
        <section className="container">
            <Today />
            <Weather />
        </section>
    );
}
