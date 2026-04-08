import Container from "../today/Container";
import Search from '../search/Search';
import NewsBriefing from '../news/NewsBrief';
import Carousel from '../carousel';

export default function MainSec() {
    return (
        <section id="mainSection" className="relative smDT:mt-15 mdDT:mt-10 lgDT:mt-15">
            <article id="center-area" className="flex smDT:flex-row mdDT:flex-col justify-center items-center smDT:gap-4 smDT:gap-6 lgDT:gap-5">
                <div className="flex flex-col justify-center items-center gap-5">
                    <Search />
                    <Container />
                </div>
                <div className="flex justify-center gap-3 w-153 h-70 lgDT:h-100">
                    <Carousel>
                        <NewsBriefing />
                        <div className="flex items-center justify-center h-full text-context font-paperlogy">
                            여기에 다른 위젯을 추가하세요.
                        </div>
                    </Carousel>
                </div>
            </article>
        </section>
    )
}