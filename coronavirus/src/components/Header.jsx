import React from 'react'
import {withRouter} from 'react-router'

const Header = (props) => {

    const navigateHome = (e) => {
        props.history.push('/')
    }

    const navigateAbout = (e) => {
        props.history.push('/about')
    }

    return (
        <div className="header-container">
        <div className="header-title">CORONAVIRUS FORECAST CENTER</div>
        <ul className="header-buttons-container">
            <div className="header-button-container" onClick={navigateHome}>
                <div className="header-button">HOME</div>
            </div>
            <div className="header-button-container" onClick={navigateAbout}>
                <div className="header-button">ABOUT</div>
            </div>
        </ul>
    </div>
    )
}

const HeaderWithRouter = withRouter(Header)
export default HeaderWithRouter
