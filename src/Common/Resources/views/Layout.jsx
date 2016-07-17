import React from 'react'

class Layout extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1" />
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
            integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7"
            crossOrigin="anonymous" />
        </head>
        <body>
          <div
            id="app-main-container">
          </div>
          <script
            type="text/javascript"
            src="/static/js/vendor.js">
          </script>
          <script
            type="text/javascript"
            src="/static/js/main.js">
          </script>
        </body>
      </html>
    )
  }
}

export default Layout