import React, {useState, useContext, useEffect} from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Label, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


import Context from '../contexts/Context'

const COLORS = {confirmed: "#FFD700", fatalities: "#D3143C"}
const DELIMIT = '^'

function Graph(props) {
  const context = useContext(Context)
  const [chartData, setChartData] = useState(null)
  const [rmsles, setRmsles] = useState({confirmed: 0, fatalities: 0})

  useEffect(() => {
    if (context.actual && props.forecast) {
      let newData = props.forecast.map((item, index) => {
          let datapoint = {
          date: item.date,
          confirmed: item.confirmed,
          fatalities: item.fatalities}
          let locationKey = props.country + DELIMIT + props.province
          console.log(context.actual)
          console.log(locationKey)
          if (context.actual[locationKey] && context.actual[locationKey][item.date]) {
            console.log('HERE')
            datapoint.confirmedActual = context.actual[locationKey][item.date].confirmed
            datapoint.fatalitiesActual = context.actual[locationKey][item.date].fatalities
          }
          return datapoint
      })
      setChartData(newData)
      computeRMSLEs(newData)
    } else {
      setChartData(null)
    }
  }, [context.actual, props.forecast, props.country, props.province])

  const computeRMSLEs = (data) => {
    let count = 0
    let sumSquaredLogError = 0
    data.forEach((item, index) => {
      if (item.confirmedActual !== undefined) {
        sumSquaredLogError += Math.pow(Math.log1p(item.confirmed) - Math.log1p(item.confirmedActual), 2)
        count += 1
      }
    })
    let confirmedRMSLE = count > 0 ? Math.pow(sumSquaredLogError / count, 0.5) : 0

    count = 0
    sumSquaredLogError = 0
    data.forEach((item, index) => {
      if (item.fatalitiesActual !== undefined) {
        sumSquaredLogError += Math.pow(Math.log1p(item.fatalities) - Math.log1p(item.fatalitiesActual), 2)
        count += 1
      }
    })
    let fatalitiesRMSLE = count > 0 ? Math.pow(sumSquaredLogError / count, 0.5) : 0
    setRmsles({confirmed: confirmedRMSLE.toFixed(2), fatalities: fatalitiesRMSLE.toFixed(2)})
  }

        return (
            <div>
                {!props.loading ?
                <div className="graph-container">

            <p class="graph-title">{props.country}{props.province ? ", " + props.province : ""}</p>
                <ResponsiveContainer width="99%" aspect={2}>
                <LineChart data={chartData}>
                <CartesianGrid/>
                <XAxis dataKey="date">
                  <Label value={"RMSLE: " + rmsles[props.metric]} position="insideBottomRight" offset={-5} style={{fill: "snow"}} />
                  </XAxis>
                <YAxis domain={['dataMin', 'dataMax']}/>
                <Tooltip contentStyle={{backgroundColor: "gray"}}/>
                <Legend />
                <Line type="monotone" name="Predicted" dataKey={props.metric} stroke={COLORS[props.metric]} activeDot={{ r: 8 }} />
                <Line type="monotone" name="Actual" dataKey={props.metric + "Actual"} stroke="steelblue" activeDot={{ r: 8 }} />
              </LineChart>
                </ResponsiveContainer>
                </div>
          : <span class="forecast-loader"><span class="loader-inner"></span></span>}
            </div>
          )
}

export default Graph