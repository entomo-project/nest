import React from 'react'
import { browserHistory } from 'react-router'

class Paginator extends React.Component {
  constructor(props) {
    super(props)
  }

  _makeLink(page) {
    if (1 === page) {
      return '/task'
    }

    return '/task?page=' + page
  }

  _handleClick(page, event) {
    event.preventDefault()

    browserHistory.push(this._makeLink(page))
  }

  _getClassName(page) {
    return this.props.currentPage === page ? 'current' : null
  }

  _previous(event) {
    if (this._previousDisabled()) {
      event.preventDefault()

      return
    }

    this._handleClick(this.props.currentPage - 1, event)
  }

  _next(event) {
    if (this._nextDisabled()) {
      event.preventDefault()

      return
    }

    this._handleClick(this.props.currentPage + 1, event)
  }

  _previousDisabled() {
    return this.props.currentPage <= 1
  }

  _nextDisabled() {
    return this.props.currentPage >= this.props.totalPages
  }

  render() {
    return (
      <div className="pagination-wrapper">
        <ul className="pagination">
          {(() => {
            const currentPage = this.props.currentPage
            const rows = []
            const previousDisabled = this._previousDisabled()
            const nextDisabled = this._nextDisabled()

            rows.push(
              <li key="previous" className={previousDisabled ? 'disabled' : null}>
                <a disabled={previousDisabled} href={previousDisabled ? '' : this._makeLink(currentPage - 1)} onClick={this._previous.bind(this)}>
                  <span>&laquo;</span>
                </a>
              </li>
            )

            for (var i = 0; i < this.props.totalPages; i += 1) {
              const page = i + 1

              rows.push(
                <li key={i} className={this._getClassName(page)}>
                  <a href={this._makeLink(page)} onClick={this._handleClick.bind(this, page)}>
                    <span>{page}</span>
                  </a>
                </li>
              )
            }

            rows.push(
              <li key="next" className={nextDisabled ? 'disabled' : null}>
                <a disabled={nextDisabled} href={nextDisabled ? '' : this._makeLink(currentPage + 1)} onClick={this._next.bind(this)}>
                  <span>&raquo;</span>
                </a>
              </li>
            )

            return rows
          })()}
        </ul>
      </div>
    )
  }
}

export default Paginator