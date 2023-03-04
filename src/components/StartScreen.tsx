import {
  VStack,
  Spinner,
  Heading,
  Button,
  Text,
  Box,
  HStack,
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
          <Heading size="3xl" fontWeight={700}>
            WeatherVerse
          </Heading>
          <Heading
            size="md"
            fontWeight={400}
            fontStyle="italic"
            letterSpacing={".07rem"}
          >
            Every weather deserves a verse.
          </Heading>
          <Box lineHeight="40px" textAlign={"center"}>
            <Text>
              {location.city}, {location.subdivision} ({location.country})
            </Text>
            <Text>Get your current forecast as a</Text>
          </Box>
          <HStack>
            <Button onClick={() => onStart("poem")}>Write Poem</Button>
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
