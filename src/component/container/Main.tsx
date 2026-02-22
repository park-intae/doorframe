import Bottom from "../bottom/Bottom";
import FavBar from "../FavBar";
import Login from "../header/Login";
import MainSec from "./subcomponents/MainSec";

export default function Main() {
    return (
        <main className="relative flex flex-1 items-stretch">
            <Login />
            <FavBar />
            <article className="mainSec flex flex-1 flex-col h-full justify-between items-center smDT:mt-5 mdDT:mt-8 lgDT:mt-15">
                <MainSec />
                <Bottom />
            </article>
        </main>
    )
}