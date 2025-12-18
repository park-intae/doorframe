'use client';

import Bottom from "../bottom/Bottom";
import FavBar from "../FavBar";
import MainSec from "./subcomponents/MainSec";

export default function Main() {
    return (
        <main className="flex flex-1 items-stretch">
            <FavBar />
            <article className="mainSec flex flex-1 flex-col justify-around items-center">
                <MainSec />
                <Bottom />
            </article>
        </main>
    )
}