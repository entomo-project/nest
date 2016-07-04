'use strict';

import React from 'react';

//<script type="text/javascript" src="build/react.js"></script>
//<script type="text/javascript" src="build/react-dom.js"></script>
//<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.min.js"></script>

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }

  renderBodyContainerContent() {
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
          <nav className="navbar navbar-default">
            <div className="container-fluid">
              <div className="navbar-header">
                <a className="navbar-brand" href="/">Nest</a>
              </div>
            </div>
          </nav>
          <div className="container-fluid">
            { this.renderBodyContainerContent() }
          </div>
        </body>
      </html>
    );
  }
}

export default Layout;