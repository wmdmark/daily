import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  Button,
  HStack,
} from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

const getLocalDateTime = () => {
  // return the current date and time Thu, Feb 2nd h:MM am/pm"

  const date = new Date()
  const day = date.toLocaleString("en-us", { weekday: "short" })
  const month = date.toLocaleString("en-us", { month: "short" })
  const dayOfMonth = date.getDate()
  const hour = date.getHours()
  // pad the minutes
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = hour >= 12 ? "pm" : "am"
  const hour12 = hour % 12 || 12

  return `${day}, ${month} ${dayOfMonth}th ${hour12}:${minutes} ${ampm}`
}

const useAIStream = () => {
  const [streaming, setStreaming] = useState(false)
  const [data, setData]: any = useState(null)

  let url = "/weather"

  const stream = async () => {
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
      throw new Error("Network response was not ok")
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
          setData(data)
        } catch (e) {
          console.log(e)
        }
      }
    }
    setStreaming(false)

    reader.releaseLock()
  }

  return { data, stream, streaming }
}

const useWeatherImage = () => {
  let [image, setImage] = useState(null)
  let [loading, setLoading] = useState(false)

  const load = async (prompt: string) => {
    setLoading(true)
    let url = "/weather?img=" + prompt
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

function Poem() {
  const { data, stream, streaming } = useAIStream()
  const { image, loading, load } = useWeatherImage()

  const skyDescription = data?.credits?.length > 0 ? data.sky : null
  const skyColor = data?.title?.length > 0 ? data.sky_color : "gray.500"

  useEffect(() => {
    if (streaming || data) {
      return
    }
    stream()
  }, [data, streaming, stream])

  useEffect(() => {
    if (skyDescription && !loading && !image) {
      load(skyDescription)
    }
  }, [skyDescription, loading, load, image])

  const poemLines = data?.poem?.split("\n") || []

  return (
    <VStack width={"full"} height="100vh" backgroundColor={skyColor} p={6}>
      <AnimatePresence>
        {image && (
          <Box
            as={motion.div}
            width="full"
            height="full"
            position="absolute"
            top={0}
            left={0}
            filter="blur(8px)"
            backgroundImage={`url(${image})`}
            backgroundSize="cover"
            backgroundPosition="top center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </AnimatePresence>

      <VStack
        width={"full"}
        maxW="container.sm"
        bg="whiteAlpha.800"
        backdropFilter="auto"
        backdropBlur={"20px"}
        rounded="2xl"
        boxShadow={"2xl"}
        paddingX={14}
        paddingY={8}
      >
        {data?.title && (
          <Heading fontFamily={"georgia"} textAlign="center">
            {data.title}
          </Heading>
        )}
        {data?.poem && (
          <Text
            fontSize={"2xl"}
            fontFamily={"georgia"}
            lineHeight="50px"
            w="80%"
            marginX="auto"
          >
            {poemLines.map((line, index) => (
              <Text key={index}>{line}</Text>
            ))}
          </Text>
        )}
        {data?.credits && (
          <VStack
            w="full"
            borderTop="1px solid #ccc"
            marginY={4}
            paddingTop={4}
            fontFamily="mono"
            color="blackAlpha.700"
            fontSize={"sm"}
            alignItems="flex-start"
          >
            <Text>{data.credits}</Text>
            {data?.summary && <Text>{data.summary}</Text>}
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}

const useLocation = () => {
  const [location, setLocation]: any = useState(null)
  const [loading, setLoading] = useState(false)

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
    if (!location && !loading) {
      loadLocationData()
    }
  }, [location, loading])

  return { location, loading }
}

const App = () => {
  const { location, loading } = useLocation()
  const [showPoem, setShowPoem] = useState(false)

  if (showPoem) return <Poem />

  return (
    <VStack w="full" h="100vh" bg="gray.300">
      {loading && <Spinner />}
      {location && (
        <HStack>
          <Text>
            Your location: {location.city}, {location.subdivision}{" "}
            {location.country}
          </Text>
          <Button onClick={() => setShowPoem(true)}>Get your poem</Button>
        </HStack>
      )}
      {showPoem && <Poem />}
    </VStack>
  )
}

export default App
