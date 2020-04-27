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
        <div style={{backgroundColor: 'RGB(27,49,112)', height:'53px'}}>
        <div style={{display:'inline-block', margin: '15px', fontWeight:'bold'}}>CORONAVIRUS FORECAST CENTER</div>
        <ul style={{display:'inline-block', float: 'right'}}>
            <li style={{display:'inline-block', margin: '15px', fontWeight:'bold'}} onClick={navigateHome}>HOME</li>
            <li style={{display:'inline-block', margin: '15px', fontWeight:'bold'}} onClick={navigateAbout}>ABOUT</li>
        </ul>
    </div>
    )
}

const HeaderWithRouter = withRouter(Header)
export default HeaderWithRouter
