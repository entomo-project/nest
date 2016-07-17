import React from 'react'
import { Link } from 'react-router'

class App extends React.Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link to="/" className="navbar-brand">Nest</Link>
            </div>
          </div>
        </nav>
        { this.props.children }
      </div>
    )
  }
}

export default App