import React from 'react'

export default (props) => {
  return (
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1" />
        <link type="text/css" rel="stylesheet" href="/static/css/vendor.min.css" />
        <link type="text/css" rel="stylesheet" href="/static/css/main.min.css" />
      </head>
      <body>
        <div id="app-container"></div>
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: props.strNestConfig}}>
        </script>
        <script type="text/javascript" src="/static/js/vendor.js"></script>
        <script type="text/javascript" src="/static/js/app.js"></script>
      </body>
    </html>
  )
}