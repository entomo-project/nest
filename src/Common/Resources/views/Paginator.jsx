import React from 'react'
import { browserHistory } from 'react-router'

class Paginator extends React.Component {
  constructor(props) {
    super(props)
  }

  _makeLink(page, pageSize) {
    const params = {}

    if (page > 1) {
      params.page = page
    }

    if (undefined !== pageSize) {
      params.pageSize = pageSize
    } else {
      if (this.props.pageSize > 10) {
        params.pageSize = this.props.pageSize
      }
    }

    return browserHistory.createPath({ pathname: '/task', query: params })
  }

  _navigateToPage(page, pageSize) {
    browserHistory.push(this._makeLink(page, pageSize))
  }

  _handleClick(page, event) {
    event.preventDefault()

    this._navigateToPage(page)
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

  _handlePageSizeChange(event) {
    this._navigateToPage(1, event.target.value)
  }

  render() {
    return (
      <div className="pagination-wrapper">
        <div className="page-size-selector">
          Page size&nbsp;
          <select value={this.props.pageSize} onChange={this._handlePageSizeChange.bind(this)}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
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