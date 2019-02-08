import React, { FunctionComponent } from "react"
import ButtonAppBar from "./ButtonAppBar"

type Props = {
  head?: any
  content?: any
}

const App: FunctionComponent<Props> = () => {
  return (
    <div className="profile">
      <ButtonAppBar />
      <div className="content">Content</div>
    </div>
  )
}

export default App
