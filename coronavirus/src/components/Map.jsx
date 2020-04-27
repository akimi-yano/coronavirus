import React, { useState, useEffect, useContext } from 'react';
// import Context from '../context/Context'
import mapboxgl from 'mapbox-gl'
import countriesLayer from '../data/world'
import mapboxConfig from '../config/mapboxConfig.js'
// import { navigate } from "@reach/router"
import Axios from 'axios'

let map

const COLORS = {confirmed: 'yellow', fatalities: 'red'}

const Map = (props) => {
    // const context = useContext(Context)
    const [highlightedCountry, setHighlightedCountry] = useState("")
    const [layerId, setLayerId] = useState('0')

    useEffect(() => {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/akihime/ck7zc036p09bw1imsbnw9ibjd',
            center: [-74.50, 40],
            zoom: 2,
            user_name: mapboxConfig.userName,
            accessToken: mapboxConfig.accessToken
        })
        // // let myMap = L.map("worldMap").setView([40, -74.50], 9);
        // L.tileLayer('https://api.mapbox.com/styles/v1/{user_name}/{style_id}/tiles/256/{z}/{x}/{y}?access_token={mapboxAccessToken}', {
        //     attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        //     minZoom: 2,
        //     maxZoom: 6,
        //     style_id: "ck7zc036p09bw1imsbnw9ibjd",
        // }).addTo(map);
    }, [])

    useEffect(() => {

        if (props.worldPrediction) {
            if (layerId > 0) {
                map.removeLayer(layerId)
                map.removeSource(layerId)
            }
            let geoData = {
                'type': 'FeatureCollection'
            }
            let features = []
            props.worldPrediction.map((item, index) => {
                features.push({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [item.lon, item.lat]
                    },
                    'properties': {
                        'title': item.country + item.province,
                        'radius': Math.log(parseInt(item[props.metric]) + 1)
                        // 'radius': parseInt(item[props.metric]) * 0.0001
                    }
                })
            })

            let newLayerId = (parseInt(layerId) + 1).toString()
            geoData['features'] = features
            map.addSource(newLayerId, {
                'type': 'geojson',
                'data': geoData
            })
            map.addLayer({
                'id': newLayerId,
                'type': 'circle',
                'source': newLayerId,
                // 'layout':  {
                //     'text-field': ['get', 'title']
                // },
                'paint': {
                    'circle-radius': ['get', 'radius'],
                    'circle-color': COLORS[props.metric],
                    'circle-opacity': 0.5,
                    'circle-stroke-color': COLORS[props.metric],
                    'circle-stroke-width': 1,
                    'circle-stroke-opacity': 1
                }
            })
            setLayerId(newLayerId)
        }
    }, [props.worldPrediction, props.metric])

    useEffect(() => {
        if(props.lonlat) {
            map.flyTo(
                {center: [props.lonlat[0], props.lonlat[1]], essential: true, zoom: 4, speed: 0.5, curve: 1}
            )
        }
    }, [props.lonlat])

    // useEffect(() => {
    //     if (context.db) {
    //         // get countries data to get room count
    //         context.db.collection('countries').onSnapshot(countriesSnapshot => {
    //             let occupied = new Set()
    //             countriesSnapshot.forEach(country =>
    //                 country.exists ? (country.data().readRoom ? occupied.add(country.id) : null): null
    //             )

    //             let countriesOnEachFeature = (feature, layer) => {
    //                 let country = feature.properties.name
    //                 let color = occupied.has(country) ? ('navy') : ''
    //                 layer.on(
    //                     {
    //                         mouseover: highlightFeature,
    //                         mouseout: e => {
    //                             setHighlightedCountry("")
    //                             e.target.setStyle({ fillColor: color, opacity: 0.2, fillOpacity: 0.2 })
    //                         },
    //                         click: zoomToFeature
    //                     }
    //                 )
    //                 layer.setStyle({ fillColor: color, opacity: 0.2, fillOpacity: 0.2 })
    //             }
    //             if (geojson) {
    //                 geojson.remove()
    //             }
    //             geojson = L.geoJSON(countriesLayer, {
    //                 onEachFeature: countriesOnEachFeature
    //             }).addTo(map);
    //         })
    //     }
    // }, [context.db])

    const zoomToFeature = (clickEvent) => {
        let countryObject = clickEvent.target
        let countryName = countryObject.feature.properties.name
        let countryBounds = (countryObject.getBounds())

        map.fitBounds(countryBounds)
        if (countryName === "United States") {
            map.setView([38.68551, -99.49219], 5)
        } else if (countryName === "China") {
            map.setView([37.23033, 105.77637], 3)
        }
        else if (countryName === "Spain") {
            map.setView([40.66397, -3.40576], 6)
        }
        else if (countryName === "France") {
            map.setView([46.83013, 2.59277], 6)
        }
        else if (countryName === "Republic of Korea") {
            map.setView([35.88015, 127.97974], 7)
        }
        else {
            map.setView([16.541430, 7.558594], 2)
        }

        // navigate(`/enter/${clickEvent.target.feature.properties.name}`)
    }

    // const returnHandler = e =>{
    //     navigate('/')
    //     }
    return (
        <div className="center-column-container">
            {/* <div className="userName">{context.name}</div> */}

            <div className="container" id="map"></div>
            <div style={{ zIndex: '2', position: "fixed", bottom: '50px', left: '50px', position: 'absolute', border: "1px solid transparent", margin: "auto", width: '80px', height: '80px', borderRadius: "50%" }}>
                {/* <div onClick={e=>returnHandler()} style={{zIndex: '2', position: "fixed", bottom: '-70%', left: '200%',position: 'absolute' }}> */}
                {/* <img style={{width: '150px'}} src={process.env.PUBLIC_URL + '/speechBubble.png'} />
            <p style={{position: 'absolute', bottom: '36%', margin: '10px',  maxWidth: '180px', fontFamily: "'Chelsea Market', cursive", }}>Click this to change name and avatar</p> */}
                {/* </div> */}


            </div>
        </div>
    )
}

export default Map

