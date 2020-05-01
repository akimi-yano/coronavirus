import React from 'react'

import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';

// import { makeStyles } from '@material-ui/core/styles';
// import Paper from '@material-ui/core/Paper';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     display: 'flex',
//     flexWrap: 'wrap',
//     '& > *': {
//       margin: theme.spacing(1),
//       width: theme.spacing(16),
//       height: theme.spacing(16),
//     },
//   },
// }));


const About = (props) => {

    const navigateHome = (e) => {
        if (e.target.className === 'about-wrapper' || e.target.className.includes('about-close-button')) {
            props.history.push('/')
        }
        console.log(e.target.className)
    }
    // const classes = useStyles();
    return (
    //     <div className={classes.root}>
      
    //     <Paper elevation={3} />
    //   </div>
    <div className='about-wrapper' onClick={navigateHome}>
        <div className='about'>
            <div  className="about-close"><IconButton className="about-close-button"><CancelIcon onClick={navigateHome}/></IconButton></div>
            <div className="about-description">
            <p className="about-title">About</p>

            <p className="about-text">This website provides prediction of the spread of COVID19 in terms of <span className="about-colored-text1">confirmed cases</span> and <span className="about-colored-text2">fatalities</span>.</p>
<br/>
            <p className="about-text">I built this website because I wanted to foresee what the COVID19 spread will be like in the coming weeks and stay informed to keep my friends and family safe.</p>

            <p className="about-text">Originally, I participated in a Machine Learning (ML) competition to build a trained ML model from scratch to predict the spread of COVID19.</p>
            <p className="about-text">I then used this model to create a simple and user friendly interface where people can access my prediction for their own purposes.</p>
            <br/>
            <p className="about-text">This project is composed of three parts: <span className="about-colored-text3">1. ML model training (Python)</span>, <span className="about-colored-text4">2. backend API (Java)</span> and <span className="about-colored-text5">3. frontend website (JavaScript)</span>.</p>

{/* <div className="about-spacer"></div> */}
<br/>
            <p className="about-text"><span className="about-colored-text3">1. The ML model</span> was built in Python in the Jupyter notebook using libraries such as Numpy, Pandas and scikit-learn. The model I applied is LGBM model. The data for training, testing and cross validation was pulled from public data source at the <a className="about-hyperlink" href="https://github.com/CSSEGISandData/COVID-19" target="_blank">official CSSEGIS Github page</a>.</p>
            <br/>
            <p className="about-text"><span className="about-colored-text4">2. The backend service</span> was written in Java and deployed as an Azure Function to establish a server-less architecture. JPMML library was used to translate the Machine Learning model created in Python to one that Java can interpret.</p>
            <br/>
            <p className="about-text"><span className="about-colored-text5">3. The frontend design</span> was realized as a React webapp, utilizing visualization libraries such as Mapbox, Recharts and Material UI.</p>
            <br/>
            <p className="about-text">Thank you for your interest and stay safe.</p>
            </div>
            <div className="about-pic">
            <a href="https://www.kaggle.com/c/covid19-global-forecasting-week-4" target="_blank"><img className="pic-kaggle" src={process.env.PUBLIC_URL + '/kaggle-title.png'}/></a>
<div className="about-spacer"></div>
            <a href="https://www.kaggle.com/akimiyano" target="_blank"><img className="pic-kaggle" src={process.env.PUBLIC_URL + '/kaggle-profile.png'}/></a>
            </div>
        </div>
        </div>
    )
}

export default About
