'use client';

import Today from './container/subcomponents/Today';
import Weather from './container/subcomponents/Weather';

export default function Container() {
    return (
        <section className="container">
            <Today />
            <Weather />
        </section>
    );
}
