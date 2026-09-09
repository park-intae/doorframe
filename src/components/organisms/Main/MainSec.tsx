import Container from "../today/Container";
import Search from '../search/Search';
import Carousel from '../carousel';
import CalendarSlide from '../calendar/CalendarSlide';
import NewsBriefing from '../news/NewsBrief';
import CoinList from "../../molecules/coin/CoinList";
// import YoutubePlayerSlide from '../carousel/YoutubePlayerSlide';

export default function MainSec() {
    return (
        <section id="mainSection" className="relative smDT:mt-15 mdDT:mt-10 lgDT:mt-15 flex flex-col items-center gap-6 lgDT:gap-5">
            <Search />
            <article id="center-area" className="flex flex-row mdDT:flex-col justify-center items-center gap-2 lgDT:gap-5 w-full">
                <div className="flex-shrink-0 flex flex-col justify-center items-center gap-5 w-fit smDT:w-115 mdDT:w-full">
                    <Container />
                </div>
                <div className="flex-shrink-0 flex justify-center gap-3 w-full max-w-186 h-70 lgDT:h-100 px-5">
                    <Carousel>
                        <CalendarSlide />
                        <NewsBriefing />
                        <CoinList />
                        {/* <YoutubePlayerSlide /> */}
                    </Carousel>
                </div>
            </article>
        </section>
    )
}