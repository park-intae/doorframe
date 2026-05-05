import { lazy, Suspense } from "react";
import Container from "../today/Container";
import Search from '../search/Search';
import Carousel from '../carousel';

const NewsBriefing = lazy(() => import('../news/NewsBrief'));
const CoinList = lazy(() => import("../../molecules/coin/CoinList"));
const YoutubePlayerSlide = lazy(() => import('../carousel/YoutubePlayerSlide'));

export default function MainSec() {
    return (
        <section id="mainSection" className="relative smDT:mt-15 mdDT:mt-10 lgDT:mt-15">
            <article id="center-area" className="flex smDT:flex-row mdDT:flex-col justify-center items-center smDT:gap-4 smDT:gap-6 lgDT:gap-5">
                <div className="flex flex-col justify-center items-center gap-5">
                    <Search />
                    <Container />
                </div>
                <div className="flex justify-center gap-3 w-165 h-70 lgDT:h-100">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
                        <Carousel>
                            <NewsBriefing />
                            <CoinList />
                            <YoutubePlayerSlide />
                        </Carousel>
                    </Suspense>
                </div>
            </article>
        </section>
    )
}