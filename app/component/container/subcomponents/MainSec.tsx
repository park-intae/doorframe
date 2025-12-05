import Container from "../Container";
import Search from "./Search";

export default function MainSec() {
    return (
        <section className="mainSection m-20">
            <Search />
            <Container />
        </section>
    )
}