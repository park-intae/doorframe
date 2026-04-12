import { lazy, Suspense } from "react";

const Login = lazy(() => import("../../molecules/login/LoginContainer"));
const BookmarkBar = lazy(() => import("../../molecules/bookmark/BookmarkBar"));
const MainSec = lazy(() => import("./MainSec"));
const Bottom = lazy(() => import("../BottomNav/Bottom"));

export default function Main() {
    return (
        <main className="relative flex flex-1 w-full max-w-[1920px] mx-auto items-stretch h-screen overflow-hidden">
            <Suspense fallback={<div aria-label="로딩 중">Loading...</div>}>
                <header>
                    <Login />
                </header>
                <nav aria-label="북마크 바">
                    <BookmarkBar />
                </nav>
                <article className="mainSec flex flex-1 flex-col justify-between items-center h-full overflow-hidden pl-20">
                    <MainSec />
                    <Bottom />
                </article>
            </Suspense>
        </main>
    )
}