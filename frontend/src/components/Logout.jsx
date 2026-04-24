import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Logout({updaterole}) {
    let navi = useNavigate()
    useEffect(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        updaterole(null)
        navi('/')
    },[navi,updaterole])
  return (
    <div>
      
    </div>
  )
}

export default Logout
