import Today from "./subcomponents/today"
import Weather from "./subcomponents/weather"

export default function Container() {
    return (
        <div className="container">
            <Today />
            <Weather />
        </div>
    )
}