import React, { useState, useEffect } from 'react'

import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css';
import { SingleDatePicker } from 'react-dates'

import moment from 'moment'
import Graph from './Graph'
import Loading from './Loading'
import Map from './Map'
import Axios from 'axios'

const CONFIRMED = 'confirmed'
const FATALITIES = 'fatalities'
const DELIMIT = '^'

function Dash() {
    const [focusedCalendar, setFocusedCalendar] = useState(false)
    const [date, setDate] = useState(moment())
    const [country, setCountry] = useState('')
    const [province, setProvince] = useState('')
    const [lonlat, setLonlat] = useState(null)
    const [locations, setLocations] = useState([])
    const [dates, setDates] = useState([])
    const [worldPrediction, setWorldPrediction] = useState()
    const [loadingWorld, setLoadingWorld] = useState(false)
    const [loadingForecast, setLoadingForecast] = useState(false)
    const [metric, setMetric] = useState(CONFIRMED)
    const [totalConfirmed, setTotalConfirmed] = useState(null)
    const [totalFatalities, setTotalFatalities] = useState(null)
    const [forecast, setForecast] = useState([])

    useEffect(() => {
        getAllDates()
        getAllLocations()
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        document.getElementsByClassName("twitter-embed")[0].appendChild(script);
    }, [])

    useEffect(() => {
        getPredictionAllLocations()
    }, [date])

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
                let defaultLocation = response.data.locations[0]
                getForecast(defaultLocation.country, defaultLocation.province)
            })
            .catch(error => console.log(error))
    }

    const getPredictionAllLocations = (e) => {
        if (e) {
            e.preventDefault()
        }
        setLoadingWorld(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllLocations'
            + `?date=${date.format('YYYY-MM-DD')}`)
            .then(response => {
                let newLocations = response.data.locations
                    .sort((a, b) => b[CONFIRMED] - a[CONFIRMED])
                setWorldPrediction(newLocations)
            })
            .catch(error => console.log(error))
            .finally(() => setLoadingWorld(false))
    }

    const getForecast = (newCountry, newProvince) => {
        setLoadingForecast(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllDays'
            + `?country=${newCountry}` + (newProvince ? '&province=' + newProvince : ''))
            .then(response => {
                console.log(response.data.predictions)
                setForecast(response.data.predictions)
                setCountry(newCountry)
                setProvince(newProvince)
            })
            .catch(error => console.log(error))
            .finally(() => setLoadingForecast(false))
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
        getForecast(newCountry, newProvince)
    }

    return (
        <div>
            <div>
                {loadingWorld || loadingForecast ? <Loading /> : ""}
            </div>
            <div>

                <div className="horizontal-container">
                    <div className="left-column-container">

<div className="date">
    <p>Forecasts For</p>
                        <SingleDatePicker
                            date={date}
                            onDateChange={date => setDate(date)}
                            focused={focusedCalendar}
                            onFocusChange={({ focused }) => setFocusedCalendar(focused)}
                            id="date-selector"
                            noBorder={true}
                            isOutsideRange={date => {
                                let dateStr = date.format('YYYY-MM-DD')
                                return dates.length > 1
                                && (dateStr < dates[0] || dateStr > dates[dates.length-1])
                            }}
                        />
                        </div>
                        <div className="total-confirmed">
                            <p>Total Confirmed: <span className="span-confirmed">{totalConfirmed}</span></p>
                            <p>Total Fatalities: <span className="span-fatalities"> {totalFatalities} </span></p>
                        </div>

                        <div className="by-country-container">
                            <div className="by-country-header">
                                <p><span className={'span-' + metric}>{metric == 'confirmed' ? 'Confirmed Cases' : 'Fatalities'}</span> by Country/Region</p>
                            </div>
                            <div className="by-country">
                                <div>{worldPrediction ? worldPrediction.map((item, index) => {
                                    return (
                                        <button disabled={loadingForecast} className="country-button" onClick={setLocation} value={item.country + (item.province ? DELIMIT + item.province : "")}>
                                            {item.country}{item.province ? ", " + item.province : ""}: <span className={"span-" + metric}>{item[metric].toLocaleString()}</span>
                                        </button>)
                                })
                                    : ""}
                                </div>

                            </div>
                        </div>
                    </div>
                    <Map worldPrediction={worldPrediction} metric={metric} lonlat={lonlat} />
                    <div className="right-column-container">
                        <div className="top-subcontainer">
                            <select style={{ color: 'black' }} name="metric" onChange={e => setMetric(e.target.value)}>
                                <option value={CONFIRMED} defaultValue={true}>Confirmed Cases</option>
                                <option value={FATALITIES}>Fatalities</option>
                            </select>
                            <div>
                                <Graph forecast={forecast} metric={metric} loading={loadingForecast} />
                            </div>
                        </div>
                        <div className="bottom-subcontainer">
                            <section className="twitterContainer">
                                <div className="twitter-embed">
                                    <a
                                        className="twitter-timeline"
                                        data-theme="dark"
                                        data-tweet-limit="5"
                                        data-chrome="noheader nofooter noborders"
                                        href="https://twitter.com/CDCGov"
                                    />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dash
