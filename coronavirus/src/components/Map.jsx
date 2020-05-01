import React, { useState, useEffect, useContext } from 'react';
// import Context from '../context/Context'
import mapboxgl from 'mapbox-gl'
import countriesLayer from '../data/world'
import mapboxConfig from '../config/mapboxConfig.js'
// import { navigate } from "@reach/router"
import Axios from 'axios'

let map

const COLORS = { confirmed: 'yellow', fatalities: 'red' }
const CONCAT = '^'

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
                        'title': item.country + CONCAT + item.province,
                        'radius': Math.log(parseInt(item[props.metric]) + 1),
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

            // When a click event occurs on a feature in the places layer, open a popup at the
            // location of the feature, with description HTML from its properties.
            map.on('click', newLayerId, function (e) {
                if (props.setLocation) {
                    let event = { target: { value: e.features[0].properties.title } }
                    props.setLocation(event)
                }
            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', newLayerId, function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', newLayerId, function () {
                map.getCanvas().style.cursor = '';
            });
        }
    }, [props.worldPrediction, props.metric])

    useEffect(() => {
        if (props.lonlat) {
            map.flyTo(
                { center: [props.lonlat[0], props.lonlat[1]], essential: true, zoom: 4, speed: 0.5, curve: 1 }
            )
        }
    }, [props.lonlat])

    return (
        <div className="center-column-container">
            <div className="container" id="map"></div>
            <div style={{ zIndex: '2', position: "fixed", bottom: '50px', left: '50px', position: 'absolute', border: "1px solid transparent", margin: "auto", width: '80px', height: '80px', borderRadius: "50%" }}>


            </div>
        </div>
    )
}

export default Map

