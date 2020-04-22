import React, { useState, useEffect } from 'react'
import Axios from 'axios'

const Prediction = () => {
    const [state, setState] = useState()
    const [country, setCountry] = useState()
    const [province, setProvince] = useState()
    const [prediction, setPrediction] = useState()
    useEffect(() => {
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/locations')
            .then(response => {
                setState(response.data)
            })

            .catch(error => console.log(error));
    }, [])

    const getPrediction = (e) => {
        e.preventDefault()
        Axios.get('https://coronavirus-kaggle.azurewebsites.net/api/predictAll'
        + `?country=${country}` + (province ? `&province=${province}` : ""))
            .then(response => {
                setPrediction(response.data)
            })

            .catch(error => console.log(error));
    }

    return (
        <div>
            <p>choose a country to predict</p>
            Current country: {country}
            <form onSubmit={getPrediction}>
                {state != null ?
                    <div>

                        <select name="country" onChange={e => {
                            setCountry(e.target.value)
                            setProvince(null)
                            }}>
                            (<option value="">--select a country--</option>)
                    {state.countries.map((item, index) =>
                            (<option value={item.name}>{item.name}</option>)
                        )}
                        </select>

                        {country != null && state.countries.find(elem=>elem.name==country).provinces.length > 0 ?
                        <div>

                        <select name="province" onChange={e => setProvince(e.target.value)}>
                            (<option value="">--select a province--</option>)
    {state.countries.find(elem=>elem.name==country).provinces.map((item, index) =>
                            (<option value={item.name}>{item.name}</option>)
                        )}
                        </select>
                        </div>
                        : ""}
                    </div>
                    : ""}
                {/* {state != null ? state.countries.map((item, index) => (

                            <div>
                    <select name="country">
                                <option vallue="{item.name}">{item.name}</option>
                </select>
                {item.provinces.length ? item.provinces.map((option, idx) => (
                                    <select name="province">
                                        <option vallue="{option.name}">{option.name}</option>
                                    </select>
                                )) : null}
                                </div>
                                )) : ""} */}

                <button type="submit">Predict</button>
            </form>
                {prediction ?
                <div>
                <p>Predicted Confirmed Cases: {prediction.confirmed}</p>
                <p>Predicted Fatalities: {prediction.fatalities}</p>
                </div>
                : ""}

        </div>
    )
}

export default Prediction
