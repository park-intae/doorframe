import Container from "./mainSec/Container";
import Search from "./mainSec/Search";
import NewsBriefing from "./NewsBrief";

export default function MainSec() {
    return (
        <section className="mainSection relative mt-[10vh] w-screen smDT:">
            <article className="center-area absolute left-1/2 -translate-x-1/2">
                <Search />
                <Container />
            </article>
            <NewsBriefing />
        </section>
    )
}