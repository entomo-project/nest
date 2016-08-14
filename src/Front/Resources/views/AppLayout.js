import React from 'react'
import { Link } from 'react-router'

export default (props) => {
  return (
    <div className="app-layout">
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">Nest</Link>
          </div>
        </div>
      </nav>
      <div className="container-fluid">
        {props.children}
      </div>
    </div>
  )
}