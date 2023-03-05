import { useEffect, useState } from "react"
import useAIStream from "./useAIStream"
import { preloadImage } from "./utils"

export const useWeatherImage = () => {
  let [image, setImage] = useState(null)
  let [loading, setLoading] = useState(false)

  const load = async (prompt: string) => {
    if (loading) return
    setLoading(true)
    let url = "/weather?img=" + prompt
    console.log(url)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    let result = await response.json()
    let img = result.data[0].url
    setImage(img)
    setLoading(false)
    return img
  }

  return { image, loading, load }
}

export const useLocation = () => {
  const [location, setLocation]: any = useState(null)
  const [loading, setLoading] = useState(true)

  const loadLocationData = async () => {
    const url = "/weather?location=true"
    setLoading(true)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    let result = await response.json()
    setLocation(result)
    setLoading(false)
  }

  useEffect(() => {
    if (!location) {
      loadLocationData()
    }
  }, [location, loading])

  return { locationData: location, loading }
}

export const usePoetry = () => {
  const { data, stream, error, streaming } = useAIStream()
  const { image: imageSrc, loading, load } = useWeatherImage()
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [status, setStatus] = useState("creating some ambience...")

  useEffect(() => {
    if (streaming || data) {
      return
    }
    stream()
  }, [data, streaming, stream])

  // load the background image once data.sky is set

  const shouldLoadBackgroundImage =
    !loading && !imageSrc && data?.style_of && !!data?.style_of

  useEffect(() => {
    if (shouldLoadBackgroundImage) {
      setStatus("imagining the sky...")
      load(data.sky).then((img) => {
        setStatus("get ready to see...")
        preloadImage(img).then(() => {
          setBackgroundImage(img)
        })
      })
    }
  }, [shouldLoadBackgroundImage, data, load])

  useEffect(() => {
    if (backgroundImage) {
      setStatus("crafting a poem, just for you...")
    }
  }, [backgroundImage])

  useEffect(() => {
    if (data?.poem && data?.credits?.length > 0 && !data.summary) {
      setStatus("giving credit where credit is due...")
    }
  }, [data])

  useEffect(() => {
    if (data?.summary) {
      setStatus("summarizing the actual weather in a less esoteric way...")
    }
  }, [data])

  useEffect(() => {
    if (data?.done === true) {
      setStatus("The End.")
    }
  }, [data])

  return {
    error,
    status,
    backgroundImage,
    title: data?.title,
    poem: data?.poem,
    credits: data?.credits,
    summary: data?.summary,
    sky: data?.sky,
    preamble: data?.preamble,
    poet: data?.poet,
    done: data?.done,
  }
}
