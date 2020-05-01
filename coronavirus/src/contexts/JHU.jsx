import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import parse from 'csv-parse/lib/sync'
import moment from 'moment'

import Context from "./Context"

const CONFIRMED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
const FATALITIES_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
const US_CONFIRMED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv'
const US_FATALITIES_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv'
const DELIMIT = "^"

const JHU = (props) => {

    const [actual, setActual] = useState(null)

    useEffect(() => {
        let confirmedP = Axios.get(CONFIRMED_URL).then(response => response.data)
        let fatalitiesP = Axios.get(FATALITIES_URL).then(response => response.data)
        let worldActualP = Promise.all([confirmedP, fatalitiesP]).then(values => {
            return parseData(values[0], values[1])
        })
        let usConfirmedP = Axios.get(US_CONFIRMED_URL).then(response => response.data)
        let usFatalitiesP = Axios.get(US_FATALITIES_URL).then(response => response.data)
        let usActualP = Promise.all([usConfirmedP, usFatalitiesP]).then(values => {
            return parseUSData(values[0], values[1])
        })
        Promise.all([worldActualP, usActualP]).then(values => {
            setActual({ ...values[0], ...values[1] })
        })
    }, [])

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

    const getUSHeaderMetadata = (header) => {
        let metadata = {}
        metadata.countryIdx = header.indexOf('Country_Region')
        metadata.provinceIdx = header.indexOf('Province_State')
        metadata.minDate = header.reduce(reduceMinDate)
        metadata.minDateIdx = header.indexOf(metadata.minDate)
        metadata.maxDate = header.reduce(reduceMaxDate)
        metadata.maxDateIdx = header.indexOf(metadata.maxDate)
        return metadata
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
        let confirmed_header = parse(confirmedCsv, { to_line: 1 })[0]
        let fatalities_header = parse(fatalitiesCsv, { to_ilne: 1 })[0]
        let locations = {}

        let confirmedMeta = getHeaderMetadata(confirmed_header)
        let records = parse(confirmedCsv, { from_line: 2 })
        records.forEach((item, index) => {
            let country = item[confirmedMeta.countryIdx]
            let province = item[confirmedMeta.provinceIdx]

            let date = moment(confirmedMeta.minDate)
            let data = []
            for (let i = confirmedMeta.minDateIdx; i <= confirmedMeta.maxDateIdx; i++) {
                data[date.format("YYYY-MM-DD")] = { confirmed: item[i] }
                date = date.add(1, 'days')
            }
            locations[country + DELIMIT + province] = data
        })

        let fatalitiesMeta = getHeaderMetadata(fatalities_header)
        if (confirmedMeta.minDate === fatalitiesMeta.minDate && confirmedMeta.maxDate === fatalitiesMeta.maxDate) {
            let records = parse(fatalitiesCsv, { from_line: 2 })
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
        return locations
    }

    const parseUSData = (confirmedCsv, fatalitiesCsv) => {
        let confirmed_header = parse(confirmedCsv, { to_line: 1 })[0]
        let fatalities_header = parse(fatalitiesCsv, { to_ilne: 1 })[0]
        let locations = {}

        let confirmedMeta = getUSHeaderMetadata(confirmed_header)
        let records = parse(confirmedCsv, { from_line: 2 })
        records.forEach((item, index) => {
            let country = item[confirmedMeta.countryIdx]
            let province = item[confirmedMeta.provinceIdx]

            let date = moment(confirmedMeta.minDate)
            let data = locations[country + DELIMIT + province]
            if (data === undefined) {
                let data = []
                for (let i = confirmedMeta.minDateIdx; i <= confirmedMeta.maxDateIdx; i++) {
                    data[date.format("YYYY-MM-DD")] = { confirmed: parseInt(item[i]) }
                    date = date.add(1, 'days')
                }
                locations[country + DELIMIT + province] = data
            } else {
                for (let i = confirmedMeta.minDateIdx; i <= confirmedMeta.maxDateIdx; i++) {
                    data[date.format("YYYY-MM-DD")].confirmed += parseInt(item[i])
                    date = date.add(1, 'days')
                }
            }
        })

        let fatalitiesMeta = getUSHeaderMetadata(fatalities_header)
        if (confirmedMeta.minDate === fatalitiesMeta.minDate && confirmedMeta.maxDate === fatalitiesMeta.maxDate) {
            let records = parse(fatalitiesCsv, { from_line: 2 })
            records.forEach((item, index) => {
                let country = item[fatalitiesMeta.countryIdx]
                let province = item[fatalitiesMeta.provinceIdx]

                let date = moment(confirmedMeta.minDate)
                let data = locations[country + DELIMIT + province]
                if (data) {
                    for (let i = fatalitiesMeta.minDateIdx; i <= fatalitiesMeta.maxDateIdx; i++) {
                        let elem = data[date.format("YYYY-MM-DD")]
                        if (elem.fatalities  === undefined) {
                            elem.fatalities = parseInt(item[i])
                        } else {
                            elem.fatalities += parseInt(item[i])
                        }
                        date = date.add(1, 'days')
                    }
                }
            })
        }
        return locations
    }

    return (
        <div>
            <Context.Provider value={{ actual }}>
                {props.children}
            </Context.Provider>
        </div>
    )
}

export default JHU
