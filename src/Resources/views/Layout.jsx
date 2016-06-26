'use strict';

import React from 'react';

class Layout extends React.Component {
  constructor(props) {
    super(props);
  }
  renderBody() {
  }
  render() {
    return (
      <html>
        <head>
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
            integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7"
            crossOrigin="anonymous" />
        </head>
        <body>
          { this.renderBody() }
        </body>
      </html>
    );
  }
}

export default Layout;