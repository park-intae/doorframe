'use client';

import Bottom from "../bottom/Bottom";
import FavBar from "../favBar/FavBar";
import MainSec from "./subcomponents/MainSec";

export default function Main() {
    return (
        <main className="flex h-[calc(100vh-64px)]">
            <FavBar />
            <article className="flex flex-1 flex-col overflow-auto justifi-center items-center">
                <MainSec />
                <Bottom />
            </article>
        </main>
    )
}