export default function Weather() {
    //공공api 포털에서 기상청 데이터 받아오셈 api검색해서 찾고    

    return (
        <div className="weather">
            <div className="weatherIco"></div>
            <div className="weatehrTxt">
                <div className="temper"></div>
                <div className="state"></div>
                <div className="region"></div>
            </div>
        </div>
    )
}