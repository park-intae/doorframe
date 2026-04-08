import Container from "./mainSec/Container";
import Search from "./mainSec/Search";
import NewsBriefing from "./mainSec/NewsBrief";

export default function MainSec() {
    return (
        <section id="mainSection" className="relative smDT:mt-15 mdDT:mt-10 lgDT:mt-15">
            <article id="center-area" className="flex smDT:flex-row mdDT:flex-col justify-center items-center smDT:gap-4 smDT:gap-6 lgDT:gap-5">
                <div className="flex flex-col justify-center items-center gap-5">
                    <Search />
                    <Container />
                </div>
                <NewsBriefing />
            </article>
        </section>
    )
}