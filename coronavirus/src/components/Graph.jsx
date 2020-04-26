import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

function Graph(props) {
        return (
            <div>
                {!props.loading ?
            <LineChart
            width={500}
            height={300}
            data={props.forecast}
          >
            <CartesianGrid/>
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin', 'dataMax']}/>
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={props.metric} stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
          : <div className="loading"></div>}
            </div>
          )
}

export default Graph