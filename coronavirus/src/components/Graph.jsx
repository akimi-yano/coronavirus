import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {confirmed: "#FFD700", fatalities: "#D3143C"}

function Graph(props) {
        return (
            <div>
                {!props.loading ?
                <div className="graph-container">

            <p class="graph-title">{props.country}{props.province ? ", " + props.province : ""}</p>
                <ResponsiveContainer width="99%" aspect={2}>
                <LineChart
                data={props.forecast}
              >
                <CartesianGrid/>
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin', 'dataMax']}/>
                <Tooltip contentStyle={{backgroundColor: "gray"}}/>
                <Line type="monotone" dataKey={props.metric} stroke={COLORS[props.metric]} activeDot={{ r: 8 }} />
              </LineChart>
                </ResponsiveContainer>
                </div>
          : <span class="forecast-loader"><span class="loader-inner"></span></span>}
            </div>
          )
}

export default Graph