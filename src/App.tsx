import { VStack, Button, HStack, Text, Link, Box } from "@chakra-ui/react"
import { AnimatePresence } from "framer-motion"
import { useState } from "react"
import Poet from "./components/Poet"
import StartScreen from "./components/StartScreen"

const App = () => {
  const [showPoemStyle, setShowPoemStyle]: any = useState()

  const handleStart = (style: string) => {
    setShowPoemStyle(style)
  }

  return (
    <Box
      display={"flex"}
      minH="100vh"
      flexDir={"column"}
      bgGradient={"linear(to-r, gray.100, gray.200, gray.300)"}
      fontFamily={"system-ui"}
      w="full"
      __css={{
        WebkitFontSmoothing: "antialiased",
        // p: {
        //   fontSize: "1.2rem",
        //   fontFamily: "serif",
        // },
        h1: {
          fontFamily: "'ivypresto-display', serif",
        },
        h2: {
          fontFamily: "'ivypresto-display', serif",
        },
        button: {
          fontFamily: "system-ui",
        },
      }}
    >
      <VStack flexGrow={1}>
        <AnimatePresence>
          {!showPoemStyle && <StartScreen key="start" onStart={handleStart} />}
          {showPoemStyle && <Poet key="poet" style={showPoemStyle} />}
          {showPoemStyle && (
            <Button
              key="restart"
              onClick={() => setShowPoemStyle(undefined)}
              position="fixed"
              bottom={4}
              right={4}
              bg="whiteAlpha.700"
              backdropBlur={"40px"}
              rounded={"xl"}
              size="sm"
              zIndex={2}
            >
              Restart
            </Button>
          )}
        </AnimatePresence>
      </VStack>
      <Box flexShrink={0} as="footer" w="full" p={3} pos="relative" zIndex={1}>
        <Text
          fontFamily={"'ivypresto-display'"}
          fontStyle="italic"
          letterSpacing={"wide"}
          w="full"
          textAlign={"center"}
        >
          The least effecient way to check the weather created by{" "}
          <Link
            href="https://twitter.com/wmdmark"
            textDecoration={"underline"}
            color={"black"}
          >
            @wmdmark
          </Link>
        </Text>
      </Box>
    </Box>
  )
}

export default App
