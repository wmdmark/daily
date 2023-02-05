import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  Button,
  HStack,
  Spacer,
} from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import Balancer from "react-wrap-balancer"

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
      setError(response.statusText)
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

const preloadImage = async (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

const usePoetry = () => {
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
  useEffect(() => {
    if (!loading && data?.preamble && !imageSrc) {
      setStatus("imagining the sky...")
      load(data.sky).then((img) => {
        setStatus("get ready to see...")
        preloadImage(img).then(() => {
          setBackgroundImage(img)
        })
      })
    }
  }, [data, loading, imageSrc, load])

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

const Poem = ({ title, poem }) => {
  if (!title) {
    return null
  }

  const poemLines = poem?.split("\n").filter((l) => l.length > 1) || []

  console.log(poemLines)

  return (
    <VStack mb={4} w="full">
      <Heading as={Balancer} size="2xl" fontFamily="'Corben', serif" mb={6}>
        {title}
      </Heading>
      <Box w="full" maxW="80%" margin="0 auto">
        {poemLines.map((line, i) => (
          <Text
            key={`line-${i}`}
            fontSize={["xl", "xl"]}
            fontFamily={"serif"}
            mb={4}
          >
            {line}
          </Text>
        ))}
      </Box>
    </VStack>
  )
}

const Credits = ({ credits }) => {
  if (!credits) {
    return null
  }

  return (
    <VStack
      w="full"
      fontSize="md"
      fontStyle="italic"
      color="blackAlpha.600"
      borderTop="1px solid"
      borderColor={"blackAlpha.400"}
      pt={4}
    >
      <Text>{credits}</Text>
    </VStack>
  )
}

const Summary = ({ summary }) => {
  if (!summary) {
    return null
  }

  return (
    <Box w="full" fontSize="md" fontStyle="italic" color="blackAlpha.600">
      <Text>{summary}</Text>
    </Box>
  )
}

const PoemReader = ({ poem }) => {
  return (
    <Box pb={4} w="full" display="flex" justifyContent={"center"}>
      <audio controls>
        <source src={`/weather?say=${poem}`} type="audio/mpeg" />
      </audio>
    </Box>
  )
}

const Poet = () => {
  const { backgroundImage, error, title, preamble, poem, credits, summary } =
    usePoetry()

  return (
    <VStack
      as={motion.div}
      width={"full"}
      height="100vh"
      p={[6, 6]}
      pos="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {backgroundImage && (
          <Box
            key="background"
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            width="full"
            height="full"
            backgroundImage={`url(${backgroundImage})`}
            backgroundSize="cover"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            // blur it nad scale it a little
            __css={{
              filter: "blur(10px)",
              transform: "scale(1.4)",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {title ? (
          <VStack
            key="poem"
            as={motion.div}
            pos={"relative"}
            px={[8, 20]}
            py={[4, 10]}
            backgroundColor="whiteAlpha.700"
            backdropBlur={"40px"}
            rounded={"xl"}
            boxShadow={"xl"}
            w="full"
            maxW={"container.sm"}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            alignItems="flex-start"
          >
            <Poem title={title} poem={poem} />

            {credits && <PoemReader poem={title + "\n" + poem} />}

            <Box w="full" textAlign={"left"}>
              <Credits credits={credits} />
              <Spacer h={4} />
              <Summary summary={summary} />
            </Box>
          </VStack>
        ) : (
          <VStack
            key="loading"
            fontFamily={"mono"}
            as={motion.div}
            fontSize={"11px"}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            maxW={"300px"}
            w="full"
          >
            <HStack>
              <Spinner size="md" color="gray.500" />
              <Text>Preparing...</Text>
            </HStack>
            {/* {sky && <Text>{sky}</Text>} */}
            {preamble && <Text>{preamble}</Text>}
          </VStack>
        )}
      </AnimatePresence>
      {error && (
        <VStack>
          <Text color="red.600">
            Oops, something went wrong trying to get the weather. Sorry about
            that, this happens sometimes trying to contact the weather service.
            Try refreshing your browser and starting again.
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </Text>
        </VStack>
      )}
    </VStack>
  )
}

const useLocation = () => {
  const [location, setLocation]: any = useState(null)
  const [loading, setLoading] = useState(true)

  const loadLocationData = async () => {
    console.log("loading location")
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
    console.log("load?", { location, loading })
    if (!location) {
      loadLocationData()
    }
  }, [location, loading])

  return { location, loading }
}

const StartScreen = ({ onStart }) => {
  const { location, loading } = useLocation()

  return (
    <VStack
      as={motion.div}
      w="full"
      maxW={"container.sm"}
      p={6}
      initial={{ opacity: 0, filter: "blur(20px)" }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          duration: 0.5,
        },
      }}
      exit={{
        filter: "blur(20px)",
        opacity: 0,
      }}
    >
      {loading ? (
        <Spinner />
      ) : (
        <VStack>
          <Heading>WeatherVerse</Heading>
          <Box fontFamily={"Georgia"} lineHeight="40px" textAlign={"center"}>
            <Text>It looks like you are located in</Text>
            <Text>
              {location.city}, {location.subdivision} ({location.country})
            </Text>
          </Box>
          <Button onClick={() => onStart()}>Write me a poem</Button>
        </VStack>
      )}
    </VStack>
  )
}

const App = () => {
  const [showPoet, setShowPoet] = useState(false)

  return (
    <VStack
      w="full"
      h="100vh"
      bg="gray.300"
      fontFamily={"'EB Garamond', serif"}
      __css={{
        WebkitFontSmoothing: "antialiased",
        h1: {
          fontFamily: "'Corben', serif",
        },
        h2: {
          fontFamily: "'Corben', serif",
        },
        button: {
          fontFamily: "system-ui",
        },
      }}
    >
      <AnimatePresence>
        {!showPoet && (
          <StartScreen key="start" onStart={() => setShowPoet(true)} />
        )}
        {showPoet && <Poet key="poet" />}
        {showPoet && (
          <Button
            key="restart"
            onClick={() => setShowPoet(false)}
            position="fixed"
            bottom={4}
            right={4}
            bg="whiteAlpha.700"
            backdropBlur={"40px"}
            rounded={"xl"}
            size="sm"
          >
            Restart
          </Button>
        )}
      </AnimatePresence>
    </VStack>
  )
}

export default App
