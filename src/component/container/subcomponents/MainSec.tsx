import Container from "./mainSec/Container";
import Search from "./mainSec/Search";
import NewsBriefing from "./mainSec/NewsBrief";

export default function MainSec() {
    return (
        <section className="mainSection relative smDT:mt-15 mdDT:mt-10 lgDT:mt-20">
            <article className="center-area flex flex-col justify-center items-center smDT:gap-4 smDT:gap-6 lgDT:gap-8">
                <div className="flex flex-col justify-center items-center gap-5">
                    <Search />
                    <Container />
                </div>
                <NewsBriefing />
            </article>
        </section>
    )
}