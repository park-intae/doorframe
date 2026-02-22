import Login from "./login/Login";

export default function Header() {
    return (
        <header className="flex justify-between items-center py-3 px-5">
            <img
                src="/logo.png"
                alt='로고'
                width={35}
                height={40}
                className="my-2"
            />
            <Login />
        </header>
    )
}