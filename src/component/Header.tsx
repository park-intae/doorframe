import Login from "./header/Login";

export default function Header() {
    return (
        <header className="flex justify-between items-center bg-white">
            <img
                src="/logo.png"
                alt='로고'
                width={35}
                height={40}
                className="my-2 mx-3"
            />
            <Login />
        </header>
    )
}