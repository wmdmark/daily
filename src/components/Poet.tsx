import { VStack, Spacer, Box, HStack, Heading, Spinner } from "@chakra-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { usePoetry } from "../hooks"
import { Poem, Credits, Summary } from "./Poem"

const Poet = ({ style }) => {
  const { backgroundImage, title, poem, credits, summary } = usePoetry()

  return (
    <VStack width={"full"} p={[6, 6]} pos="relative" height={"full"}>
      <AnimatePresence>
        {backgroundImage && (
          <Box
            as={motion.div}
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
            initial={{ opacity: 0, filter: "blur(20px)", scale: 1.7 }}
            animate={{ opacity: 1, filter: "blur(10px)", scale: 1.4 }}
            // // blur it nad scale it a little
            // __css={{
            //   filter: "blur(10px)",
            //   transform: "scale(1.4)",
            // }}
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
            rounded={"md"}
            boxShadow={"xl"}
            w="full"
            maxW={"container.sm"}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            alignItems="flex-start"
          >
            <Poem title={title} poem={poem} />

            {/* {credits && <PoemReader poem={title + "\n" + poem} />} */}

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
            h="100vh"
          >
            <HStack>
              <Spinner size="md" color="gray.500" />
              <Heading>Preparing...</Heading>
            </HStack>
            {/* {preamble && <Text>{preamble}</Text>} */}
          </VStack>
        )}
      </AnimatePresence>
      {/* TODO: only show this if there is an error and a certain amount of time has passed */}
      {/* {error && (
        <VStack>
          <Text color="red.600">
            Oops, something went wrong trying to get the weather. Sorry about
            that, this happens sometimes trying to contact the weather service.
            Try refreshing your browser and starting again.
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </Text>
        </VStack>
      )} */}
    </VStack>
  )
}

export default Poet
