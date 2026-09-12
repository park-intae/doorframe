import Container from "../today/Container";
import Search from '../search/Search';
import Carousel from '../carousel';
import CalendarSlide from '../calendar/CalendarSlide';
import NewsBriefing from '../news/NewsBrief';
import CoinList from "../../molecules/coin/CoinList";
// import YoutubePlayerSlide from '../carousel/YoutubePlayerSlide';

export default function MainSec() {
    return (
        <section id="mainSection" className="relative mt-0 pb-10 flex flex-col items-center gap-3 w-full">
            <Search />
            <article id="center-area" className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-5 lg:gap-6 w-full">
                <div className="flex-shrink-0 flex flex-col justify-center items-center w-full max-w-[390px] smDT:w-[390px] mdDT:w-[400px]">
                    <Container />
                </div>
                <div className="flex-shrink-0 flex justify-center w-full max-w-[480px] smDT:w-[480px] mdDT:w-[500px] h-[470px]">
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