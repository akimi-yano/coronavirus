import React from 'react'

const About = () => {
    return (
        <div className='about'>
            <p>
            Welcome to Coronavirus Forecast Center.

This website provides prediction of the spread of COVID19 in terms of confirmed cases and fatalities.

The reason why I made this website was because I wanted to be able to foresee what the COVID19 spread will be like in the next few days or weeks to make good life decisions. 

Additionally, I had recently participated in a Machine Learning competition to build a trained Machine Learning model to predict the spread of COVID19 and wanted to use the model to create a simple and user friendly interface where people can access my prediction for their own purposes.

In order to create this website, I used three different programming languages: Java, Python, JavaScript.

Java was used in Azure cloud function to establish a server-less architecture and JPMML library was used to translate the Machine Learning model created in Python to what Java can interpret.

The Machine Learning model was built in Python in the Jupyter notebook using libraries such as Numpy, Pandas, Scikit-learn. The model I applied for is LGBM model. The data for training, testing and cross validation was pulled from public data source at https://github.com/CSSEGISandData/COVID-19.

Front end design was realized by JavaScript and its libraries including React, Mapbox, Recharts and Material UI.

Thank you for your interest.

            </p>
        </div>
    )
}

export default About
