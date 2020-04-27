import React from 'react'

const Header = () => {
    return (
        <div style={{backgroundColor: 'RGB(27,49,112)', height:'53px'}}>
        <div style={{display:'inline-block', margin: '15px', fontWeight:'bold'}}>CORONAVIRUS FORECAST CENTER</div>
        <ul style={{display:'inline-block', float: 'right'}}>
            <li style={{display:'inline-block', margin: '15px', fontWeight:'bold'}}>HOME</li>
            <li style={{display:'inline-block', margin: '15px', fontWeight:'bold'}}>ABOUT</li>
        </ul>
    </div>
    )
}

export default Header
