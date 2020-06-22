import React, { useState, useEffect } from 'react'
import { makeStyles, Select, MenuItem } from "@material-ui/core"
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

const useStyles = makeStyles((theme) => ({
    confirmedDropdown: {
        margin: "4px",
        padding: "4px",
        color: "yellow",
        backgroundColor: "rgb(60,60,60)"
    },
    fatalitiesDropdown: {
        margin: "4px",
        padding: "4px",
        color: "crimson",
        backgroundColor: "rgb(60,60,60)"
    },
    confirmed: {
        color: "yellow",
        border: "0"
    },
    fatalities: {
        color: "crimson",
        border: "0"
    }
}));

function Dash() {
    const [focusedCalendar, setFocusedCalendar] = useState(false)
    const [date, setDate] = useState(moment())
    const [country, setCountry] = useState('')
    const [province, setProvince] = useState('')
    const [lonlat, setLonlat] = useState(null)
    const [locations, setLocations] = useState([])
    const [dates, setDates] = useState([])
    const [worldPrediction, setWorldPrediction] = useState()
    const [filteredWorldPrediction, setFilteredWorldPrediction] = useState()
    const [searchTerm, setSearchTerm] = useState("")
    const [loadingWorld, setLoadingWorld] = useState(false)
    const [loadingForecast, setLoadingForecast] = useState(false)
    const [metric, setMetric] = useState(CONFIRMED)
    const [totalConfirmed, setTotalConfirmed] = useState(null)
    const [totalFatalities, setTotalFatalities] = useState(null)
    const [forecast, setForecast] = useState([])

    const classes = useStyles();

    useEffect(() => {
        getAllDates()
        getAllLocations()
        // const script = document.createElement("script");
        // script.src = "https://platform.twitter.com/widgets.js";
        // document.getElementsByClassName("twitter-embed")[0].appendChild(script);
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

    useEffect(() => {
        if (worldPrediction) {
            let filtered = worldPrediction.filter(elem =>
                (elem.country.toLowerCase() + (elem.province ? ", " + elem.province.toLowerCase() : "")).includes(searchTerm.toLowerCase()))
            setFilteredWorldPrediction(filtered)
        }
    }, [worldPrediction, searchTerm])

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

    const getPredictionAllLocations = () => {
        setLoadingWorld(true)
        // Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllLocations'
        //     + `?date=${date.format('YYYY-MM-DD')}`)
        // TODO remove hardcode date after data is available again on Kaggle
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllLocations'
            + `?date=2020-06-15`)
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
                                        && (dateStr < dates[0] || dateStr > dates[dates.length - 1])
                                }}
                            />
                        </div>
                        <div className="total-confirmed">
                            <p>Total Confirmed</p>
                            <p><span style={{fontSize: "32px"}} className="span-confirmed">{totalConfirmed ? totalConfirmed : '----'}</span></p>
                            <p>Total Fatalities</p>
                            <p><span style={{fontSize: "32px"}} className="span-fatalities"> {totalFatalities ? totalFatalities: '----'} </span></p>
                        </div>

                        <div className="by-country-container">
                            <div className="by-country-header">
                                <p><span className={'span-' + metric}>{metric == 'confirmed' ? 'Confirmed Cases' : 'Fatalities'}</span></p><p>by Country/Region</p>
                                <input className="location-search" type="text" placeholder="Search Location" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                            </div>
                            <div className="by-country">
                                <div>{filteredWorldPrediction ? filteredWorldPrediction.map((item, index) => {
                                    return (
                                        <button
                                            disabled={loadingForecast}
                                            className={"country-button" + (item.country === country && item.province === province ? "-selected" : "")}
                                            onClick={setLocation} value={item.country + (item.province ? DELIMIT + item.province : "")}
                                        >
                                            {item.country}{item.province ? ", " + item.province : ""}: <span className={"span-" + metric}>{item[metric].toLocaleString()}</span>
                                        </button>)
                                })
                                    : ""}
                                </div>

                            </div>
                        </div>
                    </div>
                    <Map worldPrediction={worldPrediction} metric={metric} lonlat={lonlat} setLocation={setLocation} />


                    <div className="right-column-container">
                        <div className="top-subcontainer">

                            <div className="dropdown-container">
                                Displaying
                            <Select
                                    color="primary"
                                    value={metric}
                                    onChange={e => setMetric(e.target.value)}
                                    displayEmpty
                                    className={metric == CONFIRMED ? classes.confirmedDropdown : classes.fatalitiesDropdown}
                                    inputProps={{ 'aria-label': 'Without label' }}
                                >
                                    <MenuItem style={{ backgroundColor: "rgb(39,39,39)" }} className={classes.confirmed} value={CONFIRMED}>Confirmed Cases</MenuItem>
                                    <MenuItem style={{ backgroundColor: "rgb(39,39,39)" }} className={classes.fatalities} value={FATALITIES}>Fatalities</MenuItem>
                                </Select>
                            </div>
                            <div>
                                <Graph forecast={forecast} metric={metric} loading={loadingForecast} country={country} province={province} />
                            </div>
                        </div>
                        <div className="middle-subcontainer">
                        <div className="actual-data-title">
                            Actual Data
                        </div>
                        <iframe className="actual-data" src="https://www.arcgis.com/apps/opsdashboard/index.html#/85320e2ea5424dfaaa75ae62e5c06e61"></iframe>
                            </div>
                        {/* <div className="bottom-subcontainer">
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
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dash
