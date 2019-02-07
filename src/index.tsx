import React from "react"
import ReactDOM from "react-dom"
import App from "components/App"

export function render(Component: any) {
  ReactDOM.render(<Component />, document.getElementById("root"))
}
render(App)

if (module.hot) {
  module.hot.accept("components/App", () => {
    const NewApp = require("components/App").default
    render(NewApp)
  })
}
