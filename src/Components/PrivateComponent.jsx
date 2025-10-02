import React from 'react'
import {Outlet , Navigate} from 'react-router-dom'

const PrivateComponent = () => {
    const checkUser = sessionStorage.getItem('user')
  return (
    checkUser ? <Outlet /> : <Navigate to='/login'/>
  )
}

export default PrivateComponent