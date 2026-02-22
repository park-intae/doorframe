import Container from "./mainSec/Container";
import Search from "./mainSec/Search";
import NewsBriefing from "./mainSec/NewsBrief";

export default function MainSec() {
    return (
        <section className="mainSection relative">
            <article className="center-area flex flex-col justify-center items-center gap-5">
                <div className="flex flex-col justify-center items-center gap-2">
                    <Search />
                    <Container />
                </div>
                <NewsBriefing />
            </article>
        </section>
    )
}