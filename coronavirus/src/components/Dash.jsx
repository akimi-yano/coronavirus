import React, { useState, useEffect } from 'react'
import moment from 'moment'
import Graph from './Graph'
import Map from './Map'
import Axios from 'axios'

const CONFIRMED = 'confirmed'
const FATALITIES = 'fatalities'
const DELIMIT = '^'

function Dash() {
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'))
    const [country, setCountry] = useState('')
    const [province, setProvince] = useState('')
    const [lonlat, setLonlat] = useState(null)
    const [locations, setLocations] = useState([])
    const [dates, setDates] = useState([])
    const [worldPrediction, setWorldPrediction] = useState()
    const [loading, setLoading] = useState(false)
    const [metric, setMetric] = useState(CONFIRMED)
    const [totalConfirmed, setTotalConfirmed] = useState(null)
    const [totalFatalities, setTotalFatalities] = useState(null)
    const [forecast, setForecast] = useState([])

    useEffect(() => {
        getAllDates()
        getAllLocations()
        getPredictionAllLocations()
    }, [])

    useEffect(() => {
        if (worldPrediction) {
            let newTotalConfirmed = 0
            let newTotalFatalities = 0
            worldPrediction.forEach((item, index) => {
                newTotalConfirmed += parseInt(item.confirmed)
                newTotalFatalities += parseInt(item.fatalities)
            })
            setTotalConfirmed(newTotalConfirmed.toLocaleString())
            setTotalFatalities(newTotalFatalities.toLocaleString())
        }
    }, [worldPrediction])

    const getAllDates = () => {
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/dates')
            .then(response => {
                setDates(response.data.dates.map((item, index) => item.date))
            })
            .catch(error => console.log(error))
    }

    const getAllLocations = () => {
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/locations')
            .then(response => {
                setLocations(response.data.locations)
            })
            .catch(error => console.log(error))
    }

    const getPredictionAllLocations = (e) => {
        if (e) {
            e.preventDefault()
        }
        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllLocations'
            + `?date=${date}`)
            .then(response => {
                let newLocations = response.data.locations
                .sort((a, b) => b[CONFIRMED] - a[CONFIRMED])
                setWorldPrediction(newLocations)
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }

    const setLocation = (e) => {
        let locTuple = e.target.value.split(DELIMIT)
        let newCountry = locTuple[0]
        let newProvince = ''
        if (locTuple.length > 1) {
            newProvince = locTuple[1]
        }

        // fly to location
        let location = worldPrediction
        .filter(elem => elem.country == newCountry && elem.province == newProvince)[0]
        setLonlat([location.lon, location.lat])

        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllDays'
            + `?country=${newCountry}` + (newProvince ? '&province=' + newProvince : ''))
            .then(response => {
                console.log(response.data.predictions)
                setForecast(response.data.predictions)
                setCountry(newCountry)
                setProvince(newProvince)
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
                        <select style={{color:'black'}} name="date" onChange={e => setDate(e.target.value)}>
                            {dates.map((item, index) =>
                                (<option value={item} selected={item === date}>{item}</option>)
                            )}
                        </select>
                    </div>

                    <button style={{color:'black'}} type="submit" disabled={loading}>Predict World</button>
                </form>

                        <select style={{color:'black'}} name="metric" onChange={e => setMetric(e.target.value)}>
                            <option value={CONFIRMED} defaultValue={true}>Confirmed Cases</option>
                            <option value={FATALITIES}>Fatalities</option>
                        </select>
            </div>

            <div className="horizontal-container">
               <div className="left-column-container">
                    <div className="total-confirmed">Predicted Total Confirmed: <span>{totalConfirmed}</span></div>
                    
                    <div className="by-country-container">
                    <div className="by-country-header">Predicted Confirmed Cases by Country/Region</div>
                        <div className="by-country">
                        <div>{worldPrediction ? worldPrediction.map((item, index) => {
                            return(
                                <button disabled={loading} className="country-button" onClick={setLocation} value={item.country + (item.province ? DELIMIT + item.province : "")}>
                                    {item.country}{item.province ? ", " + item.province : ""}: <span style={{pointerEvents: 'none'}}>{item.confirmed.toLocaleString()}</span>
                                </button>)
                        })
                    : ""}
                    </div>

                </div>
                </div>
                </div>
                <Map worldPrediction={worldPrediction} metric={metric} lonlat={lonlat}/>
                <div className="right-column-container">
                    <div className="right-horizontal-container">
                        <div className="top-subcontainer">
                            Predicted Total Fatalities: <span> {totalFatalities} </span>
                    </div>
                        <div className="bottom-subcontainer">
                            Forecast
<div>
    <Graph forecast={forecast} metric={metric} loading={loading}/>
                        {/* {forecast.map((item, index) => {
                            return(<li>Confirmed: <span>{item.confirmed}</span>; Fatalities: <span>{item.fatalities.toLocaleString()}</span></li>)
                        })} */}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dash
