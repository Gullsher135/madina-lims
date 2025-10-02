import React from 'react'

// ---PROFILE PICTURE---
import Profile from '../assets/profile.png'

const Navbar = () => {
  return (
    <div className="navbar">
        <h4><i>Welcome Back!</i></h4>
        <img src={Profile} alt="" />
    </div>
  )
}

export default Navbar