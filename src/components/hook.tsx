import React, { FunctionComponent, useEffect, useState } from "react"

type Props = {
  initial: number
}

export const Counter: FunctionComponent<Props> = ({ initial = 0 }) => {
  const [clicks, setClicks] = useState<Props["initial"]>(initial)
  return (
    <>
      <p>Clicks:{clicks}</p>
      <button type="button" onClick={() => setClicks(clicks + 1)}>
        +
      </button>
      <button type="button" onClick={() => setClicks(clicks - 1)}>
        +
      </button>
    </>
  )
}
export default Counter
