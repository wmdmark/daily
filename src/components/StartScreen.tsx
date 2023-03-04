import {
  VStack,
  Spinner,
  Heading,
  Button,
  Text,
  Box,
  HStack,
  Spacer,
  Divider,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { useLocation } from "../hooks"

const StartScreen = ({ onStart }) => {
  const { locationData, loading } = useLocation()

  const { location } = locationData || {}

  return (
    <VStack
      as={motion.div}
      w="full"
      h="full"
      minH="100vh"
      maxW={"container.sm"}
      alignItems="center"
      justifyContent={"center"}
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
          <Heading size="3xl" fontWeight={700} color="blackAlpha.900">
            WeatherVerse
          </Heading>
          <Heading
            size="md"
            fontWeight={400}
            fontStyle="italic"
            letterSpacing={".07rem"}
            color="blackAlpha.800"
          >
            Every weather deserves a verse.
          </Heading>
          <Spacer h={4} />
          <Divider borderColor={"blackAlpha.500"} orientation="horizontal" />
          <Box textAlign={"center"} px={4}>
            <Text>
              Get a poem about the weather in {location.city},{" "}
              {location.subdivision}
            </Text>
          </Box>
          <Spacer h={4} />
          <HStack>
            <Button
              onClick={() => onStart("poem")}
              px={6}
              py={4}
              bg="blackAlpha.900"
              color="white"
              rounded={"md"}
            >
              <Text
                fontWeight={700}
                letterSpacing={"0.07rem"}
                fontFamily={"'ivypresto-display'"}
              >
                Create Poem
              </Text>
            </Button>
            {/* <Button onClick={() => onStart("sonnet")}>Sonnet</Button>
            <Button onClick={() => onStart("hip-hop")}>Hip-Hop Song</Button>
            <Button onClick={() => onStart("prophecy")}>Prophecy</Button> */}
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}

export default StartScreen
