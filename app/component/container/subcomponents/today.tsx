export default function Today() {
    let today = new Date();

    return (
        <div className="today">
            <div className="date"></div>
            <div className="time"></div>
        </div>
    )
}