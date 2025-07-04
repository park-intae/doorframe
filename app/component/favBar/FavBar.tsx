import { RootState } from "app/store";
import { Bookmark } from "app/type/bookmark";
import { useSelector } from "react-redux";

export default function FavBar() {
    const bookmarks = useSelector((state: RootState) => state.bookmarks);

    return (
        <section className="side_bar">
            {bookmarks.map((item: Bookmark) => (
                <a className="fav" key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                    <div className="IcoBg">
                        <img src={item.icon} alt={item.title} />
                    </div>
                    <p className="tit">{item.title}</p>
                </a>
            ))}
        </section>
    )
}