import { useState } from "react"
import { getLocalDateTime } from "./utils"

const useAIStream = () => {
  const [streaming, setStreaming] = useState(false)
  const [data, setData]: any = useState(null)
  const [error, setError] = useState<string>("")

  let url = "/weather"

  const stream = async () => {
    console.log("streaming...", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        localDateTime: getLocalDateTime(),
      }),
    })

    if (!response.ok) {
      console.log("Network response was not ok", response)
      setError(`Error getting weather data: ${response.statusText}`)
      setStreaming(false)
      return
    }

    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false
    setStreaming(true)
    while (!done) {
      const { value, done: doneReading } = await reader.read()

      done = doneReading
      let chunkValue = decoder.decode(value)

      chunkValue = chunkValue.replace("data: ", "")
      if (chunkValue.indexOf("[DONE]") > -1) {
        done = true
      } else {
        try {
          const data = JSON.parse(chunkValue)
          console.log(JSON.stringify(data, null, 2))
          setData(data)
        } catch (e) {
          // console.log(e)
        }
      }
    }
    setStreaming(false)

    reader.releaseLock()
  }

  return { data, error, stream, streaming }
}

export default useAIStream
