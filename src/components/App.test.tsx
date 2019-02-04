import React from "react"
import { shallow } from "enzyme"
import App from "components/App"

describe("App", () => {
  const render = shallow(<App />)
  test("Render UI", () => {
    expect(render).toMatchSnapshot()
  })
})
