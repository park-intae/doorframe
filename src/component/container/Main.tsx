import Bottom from "../bottom/Bottom";
import FavBar from "../FavBar";
import Login from "../login/Login";
import MainSec from "./subcomponents/MainSec";

export default function Main() {
    return (
        <main className="relative flex flex-1 items-stretch min-h-dvh">
            <Login />
            <FavBar />
            <article className="mainSec flex flex-1 flex-col justify-between items-center">
                <MainSec />
                <Bottom />
            </article>
        </main>
    )
}