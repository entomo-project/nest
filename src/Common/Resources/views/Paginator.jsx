import React from 'react'
import { browserHistory } from 'react-router'

class Paginator extends React.Component {
  constructor(props) {
    super(props)
  }

  _makeLink(page) {
    return '/task?page=' + page
  }

  handleClick(page, event) {
    event.preventDefault()

    browserHistory.push(this._makeLink(page))
  }

  getClassName(page) {
    return this.props.currentPage === page ? 'current' : null
  }

  render() {
    return (
      <div className="pagination-wrapper">
        <ul className="pagination">
          {(() => {
            const rows = []

            for (var i = 0; i < this.props.totalPages; i += 1) {
              const page = i + 1

              rows.push(
                <li key={i} className={this.getClassName(page)}>
                  <a href={this._makeLink(page)} onClick={this.handleClick.bind(this, page)}>
                    <span>{page}</span>
                  </a>
                </li>
              )
            }

            return rows
          })()}
        </ul>
      </div>
    )
  }
}

export default Paginator