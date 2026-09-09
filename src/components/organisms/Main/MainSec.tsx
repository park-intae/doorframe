import { lazy, Suspense } from "react";
import Container from "../today/Container";
import Search from '../search/Search';
import Carousel from '../carousel';

const NewsBriefing = lazy(() => import('../news/NewsBrief'));
const CoinList = lazy(() => import("../../molecules/coin/CoinList"));
// const YoutubePlayerSlide = lazy(() => import('../carousel/YoutubePlayerSlide'));
import CalendarSlide from '../calendar/CalendarSlide';

export default function MainSec() {
    return (
        <section id="mainSection" className="relative smDT:mt-15 mdDT:mt-10 lgDT:mt-15 flex flex-col items-center gap-6 lgDT:gap-5">
            <Search />
            <article id="center-area" className="flex flex-row mdDT:flex-col justify-center items-center gap-2 lgDT:gap-5 w-full">
                <div className="flex-shrink-0 flex flex-col justify-center items-center gap-5 w-fit smDT:w-115 mdDT:w-full">
                    <Container />
                </div>
                <div className="flex-shrink-0 flex justify-center gap-3 w-full max-w-186 h-70 lgDT:h-100 px-5">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
                        <Carousel>
                            <CalendarSlide />
                            <NewsBriefing />
                            <CoinList />
                            {/* <YoutubePlayerSlide /> */}
                        </Carousel>
                    </Suspense>
                </div>
            </article>
        </section>
    )
}