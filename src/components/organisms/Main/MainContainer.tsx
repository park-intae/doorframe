import Bottom from "../BottomNav/Bottom";
import Login from "../../molecules/login/LoginContainer";
import BookmarkBar from "../../molecules/bookmark/BookmarkBar";
import MainSec from "./MainSec";

export default function Main() {
    return (
        <main className="relative flex flex-1 items-stretch min-h-dvh">
            <Login />
            <BookmarkBar />
            <article className="mainSec flex flex-1 flex-col justify-between items-center">
                <MainSec />
                <Bottom />
            </article>
        </main>
    )
}