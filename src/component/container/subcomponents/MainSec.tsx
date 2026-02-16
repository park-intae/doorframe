import Container from "./mainSec/Container";
import Search from "./mainSec/Search";
import NewsBriefing from "./mainSec/NewsBrief";

export default function MainSec() {
    return (
        <section className="mainSection relative mt-15">
            <article className="center-area flex flex-col justify-center items-center">
                <div className="flex flex-col justify-center items-center">
                    <Search />
                    <Container />
                </div>
                <NewsBriefing />
            </article>
        </section>
    )
}