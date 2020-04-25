import React, { useState, useEffect } from 'react'
import moment from 'moment'
import Map from './Map'
import Axios from 'axios'

function Dash() {
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'))
    const [dates, setDates] = useState([])
    const [worldPrediction, setWorldPrediction] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getAllDates()
        getPredictionAllLocations()
    },[])

    const getPredictionAllLocations = (e) => {
        if (e) {
            e.preventDefault()
        }
        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllLocations'
            + `?date=${date}`)
            .then(response => {
                setWorldPrediction(response.data.locations)
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }

    const getAllDates = () => {
        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/dates')
            .then(response => {
                setDates(response.data.dates.map((item, index) => item.date))
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }

    return (
        <div>
            <div className="title-container">
                <p>Coronavirus Forecast Dash</p>

<form onSubmit={getPredictionAllLocations}>
        <div>
            <select name="date" onChange={e => setDate(e.target.value)}>
        {dates.map((item, index) =>
                (<option value={item} defaultValue={item === date}>{item}</option>)
            )}
            </select>
        </div>

    <button type="submit" disabled={loading}>Predict World</button>
</form>
            </div>

            <div className="horizontal-container">
                <div className="left-column-container">
                    <div>Total Confirmed</div>
                    <div>Confirmed Cases by Country/Region</div>
                </div>
                <Map worldPrediction={worldPrediction} />
                <div className="right-column-container">
                    <div className="right-horizontal-container">
                        <div className="top-subcontainer">
                            Total Deaths
                    </div>
                        <div className="bottom-subcontainer">
                            Forecast
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dash
