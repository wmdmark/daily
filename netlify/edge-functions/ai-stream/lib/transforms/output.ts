import { AIFunctionConfig } from "../config.ts"

const mapStreamInputToOutputShape = (input: object, outputShape: object) => {
  /**
   * Recursively maps the shape of the input object to the outputShape object
   *
   * @param {object} input - The input object to be mapped
   * @param {object} outputShape - The outputShape object to be used as the shape reference
   * @returns {object} - The modified input object with the same shape as the outputShape object
   */

  let output: any = {}

  for (const key of Object.keys(outputShape)) {
    const outputType = typeof outputShape[key]
    if (input && input[key]) {
      if (outputType === "object") {
        if (Array.isArray(outputShape[key])) {
          // Array handling
          output[key] = input[key].map((item: any) => {
            let o = mapStreamInputToOutputShape(item, outputShape[key][0])
            return o
          })
        } else {
          output[key] = mapStreamInputToOutputShape(
            input[key],
            outputShape[key]
          )
        }
      } else {
        output[key] = input[key]
      }
    } else {
      if (outputType === "object") {
        if (Array.isArray(outputShape[key])) {
          output[key] = []
        } else {
          output[key] = {}
        }
      } else {
        output[key] = outputType === "number" ? 0 : ""
      }
    }
  }
  // console.log(JSON.stringify({ input, output }, null, 2))
  return output
}

const cleanOutputShape = (outputShape: object) => {
  // make sure all array keys are the same type of the first item
  const cleaned = {}

  for (const key of Object.keys(outputShape)) {
    if (Array.isArray(outputShape[key]) && outputShape[key].length > 0) {
      let arrayOutput = outputShape[key][0]
      if (typeof arrayOutput === "object" && arrayOutput !== null) {
        cleaned[key] = [cleanOutputShape(arrayOutput)]
      } else {
        cleaned[key] = [arrayOutput]
      }
    } else if (typeof outputShape[key] === "object" && cleaned[key] !== null) {
      cleaned[key] = cleanOutputShape(outputShape[key])
    } else {
      cleaned[key] = outputShape[key]
    }
  }
  return cleaned
}

export const transformOutput = (fn: AIFunctionConfig, data: any) => {
  try {
    let input = data || {}
    let output = fn.output

    if (typeof output === "string") {
      return input
    }

    if (Array.isArray(output)) {
      return input
    }

    if (typeof output === "object") {
      let mappedInput = mapStreamInputToOutputShape(
        input,
        cleanOutputShape(output)
      )
      return mappedInput
    }
  } catch (e) {
    console.log("error transforming output: ", e)

    if (typeof fn.output === "string") {
      return ""
    }
    if (Array.isArray(fn.output)) {
      return []
    }

    if (typeof fn.output === "object") {
      return mapStreamInputToOutputShape({}, cleanOutputShape(fn.output))
    }
  }
}
