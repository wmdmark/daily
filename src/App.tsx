import { VStack, Button } from "@chakra-ui/react"
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
    <VStack
      w="full"
      h="100vh"
      bgGradient={"linear(to-r, gray.100, gray.200, gray.300)"}
      fontFamily={"system-ui"}
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
          >
            Restart
          </Button>
        )}
      </AnimatePresence>
    </VStack>
  )
}

export default App
