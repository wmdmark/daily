import { Box } from "@chakra-ui/react"

const PoemReader = ({ poem }) => {
  return (
    <Box pb={4} w="full" display="flex" justifyContent={"center"}>
      <audio controls>
        <source src={`/weather?say=${poem}`} type="audio/mpeg" />
      </audio>
    </Box>
  )
}

export default PoemReader
