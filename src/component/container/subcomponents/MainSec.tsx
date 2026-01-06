import Container from "./mainSec/Container";
import Search from "./mainSec/Search";

export default function MainSec() {
    return (
        <section className="mainSection mt-[10vh] smDT:">
            <Search />
            <Container />
        </section>
    )
}