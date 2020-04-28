import React,{useEffect, useState} from 'react'
import Axios from 'axios'
import parse from 'csv-parse/lib/sync'
import moment from 'moment'

import Context from "./Context"

const CONFIRMED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
const FATALITIES_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
const DELIMIT = "^"

const JHU = (props) => {

    const [actual, setActual] = useState(null)

    useEffect(()=>{
        let confirmedP = Axios.get(CONFIRMED_URL).then(response => response.data)
        let fatalitiesP = Axios.get(FATALITIES_URL).then(response => response.data)
        Promise.all([confirmedP, fatalitiesP]).then(values => {
            parseData(values[0], values[1])
        })
    },[])

    const reduceMinDate = (a, b) => {
        if (!moment(a).isValid()) {
            return b
        } else if (!moment(b).isValid()) {
            return a
        }
        return moment(a) < moment(b) ? a : b
    }

    const reduceMaxDate = (a, b) => {
        if (!moment(a).isValid()) {
            return b
        } else if (!moment(b).isValid()) {
            return a
        }
        return moment(a) < moment(b) ? b : a
    }
    
    const getHeaderMetadata = (header) => {
        let metadata = {}
        metadata.countryIdx = header.indexOf('Country/Region')
        metadata.provinceIdx = header.indexOf('Province/State')
        metadata.minDate = header.reduce(reduceMinDate)
        metadata.minDateIdx = header.indexOf(metadata.minDate)
        metadata.maxDate = header.reduce(reduceMaxDate)
        metadata.maxDateIdx = header.indexOf(metadata.maxDate)
        return metadata
    }

    const parseData = (confirmedCsv, fatalitiesCsv) => {
        let confirmed_header = parse(confirmedCsv, {to_line: 1})[0]
        let fatalities_header = parse(fatalitiesCsv, {to_ilne: 1})[0]
        let locations = {}

        let confirmedMeta = getHeaderMetadata(confirmed_header)
        let records = parse(confirmedCsv, {from_line: 2})
        records.forEach((item, index) => {
            let country = item[confirmedMeta.countryIdx]
            let province = item[confirmedMeta.provinceIdx]

            let date = moment(confirmedMeta.minDate)
            let data = []
            for (let i = confirmedMeta.minDateIdx; i <= confirmedMeta.maxDateIdx; i++) {
                data[date.format("YYYY-MM-DD")] = { confirmed: item[i]}
                date = date.add(1, 'days')
            }
            locations[country + DELIMIT + province] = data
        })

        let fatalitiesMeta = getHeaderMetadata(fatalities_header)
        if (confirmedMeta.minDate === fatalitiesMeta.minDate && confirmedMeta.maxDate === fatalitiesMeta.maxDate) {
            let records = parse(fatalitiesCsv, {from_line: 2})
            records.forEach((item, index) => {
                let country = item[fatalitiesMeta.countryIdx]
                let province = item[fatalitiesMeta.provinceIdx]

                let date = moment(confirmedMeta.minDate)
                let data = locations[country + DELIMIT + province]
                if (data) {
                    for (let i = fatalitiesMeta.minDateIdx; i <= fatalitiesMeta.maxDateIdx; i++) {
                        data[date.format("YYYY-MM-DD")].fatalities = item[i]
                        date = date.add(1, 'days')
                    }
                }
            })
        }

        setActual(locations)
    }

    return (
        <div>
            <Context.Provider value={{actual}}>
                {props.children}
            </Context.Provider>
        </div>
    )
}

export default JHU
