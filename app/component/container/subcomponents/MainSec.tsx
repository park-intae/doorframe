import Container from "../Container";
import Search from "./Search";

export default function MainSec() {
    return (
        <section className="mainSection h-[80vh] m-5">
            <Search />
            <Container />
        </section>
    )
}