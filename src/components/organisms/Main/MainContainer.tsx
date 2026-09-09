import Login from "../../molecules/login/LoginContainer";
import BookmarkBar from "../../molecules/bookmark/BookmarkBar";
import MainSec from "./MainSec";
export default function Main() {
    return (
        <main className="relative flex flex-1 w-full max-w-[1920px] mx-auto items-stretch h-screen overflow-hidden">
            <header>
                <Login />
            </header>
            <nav aria-label="북마크 바">
                <BookmarkBar />
            </nav>
            <article className="mainSec flex flex-1 flex-col justify-center items-center h-full overflow-hidden pl-20">
                <MainSec />
            </article>
        </main>
    )
}