import { VStack, Heading, Box, Text } from "@chakra-ui/react"
import Balancer from "react-wrap-balancer"

export const Poem = ({ title, poem }) => {
  if (!title) {
    return null
  }

  const poemLines = poem?.split("\n").filter((l) => l.length > 1) || []

  return (
    <VStack mb={4} w="full">
      {title.length > 4 && (
        <Heading
          as={Balancer}
          size={["2xl", "3xl"]}
          fontFamily="'ivypresto-display', serif"
          fontWeight={700}
          color="blackAlpha.800"
          mb={6}
        >
          {title}
        </Heading>
      )}
      <Box w="full" maxW="80%" margin="0 auto">
        {poemLines.map((line, i) => (
          <Text
            key={`line-${i}`}
            fontSize={["xl", "2xl"]}
            fontFamily={"serif"}
            fontWeight={400}
            mb={4}
          >
            {line}
          </Text>
        ))}
      </Box>
    </VStack>
  )
}

export const Credits = ({ credits }) => {
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

export const Summary = ({ summary }) => {
  if (!summary) {
    return null
  }

  return (
    <Box w="full" fontSize="md" fontStyle="italic" color="blackAlpha.600">
      <Text>{summary}</Text>
    </Box>
  )
}
