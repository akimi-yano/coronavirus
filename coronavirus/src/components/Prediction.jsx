import React, { useState, useEffect } from 'react'
import Axios from 'axios'

const Prediction = () => {
    const [locations, setLocations] = useState()
    const [dates, setDates] = useState()
    const [ago, setAgo] = useState()
    const [country, setCountry] = useState()
    const [province, setProvince] = useState()
    const [prediction, setPrediction] = useState()
    const [worldPrediction, setWorldPrediction] = useState()
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/locations')
            .then(response => {
                setLocations(response.data)
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
        let arr = []
        for (let i = 1; i <= 24; i++) {
            arr.push(i)
        }
        setDates(arr)
    }, [])

    const getPredictionAllDays = (e) => {
        e.preventDefault()
        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllDays'
            + `?country=${country}` + (province ? `&province=${province}` : ""))
            .then(response => {
                setPrediction(response.data)
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }

    const getPredictionAllLocations = (e) => {
        e.preventDefault()
        setLoading(true)
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAllLocations'
            + `?ago=${ago}`)
            .then(response => {
                setWorldPrediction(response.data)
            })
            .catch(error => console.log(error))
            .finally(() => setLoading(false))
    }

    return (
        <div>
            <p>choose a country to predict</p>
            Current country: {country}
            <form onSubmit={getPredictionAllDays}>
                {locations != null ?
                    <div>

                        <select name="country" onChange={e => {
                            setCountry(e.target.value)
                            setProvince(null)
                        }}>
                            (<option value="">--select a country--</option>)
                    {locations.countries.map((item, index) =>
                            (<option value={item.name}>{item.name}</option>)
                        )}
                        </select>

                        {country != null && locations.countries.find(elem => elem.name == country).provinces.length > 0 ?
                            <div>

                                <select name="province" onChange={e => setProvince(e.target.value)}>
                                    (<option value="">--select a province--</option>)
    {locations.countries.find(elem => elem.name == country).provinces.map((item, index) =>
                                    (<option value={item.name}>{item.name}</option>)
                                )}
                                </select>
                            </div>
                            : ""}
                    </div>
                    : ""}

                <button type="submit" disabled={loading}>Predict</button>
            </form>
            {prediction ? prediction.predictions.map((item, index) =>
                <div>
                    <p>Predicted Confirmed Cases: {item.confirmed}</p>
                    <p>Predicted Fatalities: {item.fatalities}</p>
                </div>)
                : ""}

            <form onSubmit={getPredictionAllLocations}>
                {dates != null ?
                    <div>
                        <select name="date" onChange={e => setAgo(e.target.value)}>
                            (<option value="">--select a date--</option>)
                    {dates.map((item, index) =>
                            (<option value={item}>{item} Days Ago</option>)
                        )}
                        </select>
                    </div>
                    : ""}

                <button type="submit" disabled={loading}>Predict World</button>
            </form>
            {worldPrediction ? worldPrediction.locations.map((item, index) =>
                <div>
                    <p>Country: {item.country}</p>
                    <p>Province: {item.province}</p>
                    <p>Predicted Confirmed Cases: {item.confirmed}</p>
                    <p>Predicted Fatalities: {item.fatalities}</p>
                </div>
            )
                : ""}

        </div>
    )
}

export default Prediction
