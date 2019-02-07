import React, { Component } from "react"
import ButtonAppBar from "./ButtonAppBar"

type Props = {
  head?: any
  content?: any
}

class App extends Component<Props> {
  render() {
    return (
      <div className="profile">
        <ButtonAppBar />
        <div className="content">Content</div>
      </div>
    )
  }
}

export default App
