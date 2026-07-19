import { jsx } from "@app/html-jsx"

export const indexPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html>
      <head>
        <title>Chatium Messenger</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Chatium" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Chatium Messenger" />
        <link rel="manifest" href="/land/api/manifest" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,..." />
        <link rel="apple-touch-startup-image" href="data:image/svg+xml,..." />
        <Styles />
        <script src="/s/metric/clarity.js"></script>
        <script>{/* PWA Install Prompt handler */}</script>
      </head>
      <body>
        <div id="app" style="height: 100%; width: 100%;">
          <App />
        </div>
      </body>
    </html>
  )
})