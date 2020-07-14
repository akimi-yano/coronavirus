# Coronavirus Forecast Center: 
## Deployed: https://akimi-yano.github.io/coronavirus-prediction/#/
## Demo video: https://www.youtube.com/watch?v=_MbivAzbbWI

A world-map of the predicted spread of confirmed cases and fatalities of the COVID-19 virus in 180+ countries using machine learning.

• Built and trained multiple machine-learning models from scratch using Kaggle dataset & Python
notebook to generate prediction data over the next 30 days

• Enabled real-time visualization & prediction of the spread of the virus by deploying a Java backend 
service using serverless Azure Functions

• Demonstrated the accuracy by displaying a graphical comparison of real vs. predicted data

## Notes for updating model
1. Run Kaggle Notebook; download generated models
2. Download confirmed, fatalities, test, dates
3. copy confirmed and fatailties to jpmml-master, run the script
4. copy test, dates directly to java project directory
5. Copy the models to java function app
6. Run/Deploy azure function using the mvn commands at top of the Function file
