interface TextTransformOptions {
  accumulate: boolean
}

const defaultOptions: TextTransformOptions = {
  accumulate: true,
}

export const TextTransform = (
  options: TextTransformOptions = defaultOptions
) => {
  let accumulatedText: string = ""
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  let transformStream = new TransformStream({
    async transform(chunk, controller) {
      if (chunk.indexOf("[DONE]") > -1) {
        // controller.enqueue(`data: [DONE]\n\n`)
        return
      }

      chunk = decoder.decode(chunk)

      // remove data: prefix
      chunk = chunk.replace(/^data: /, "")
      // remove trailing newlines
      chunk = chunk.replace(/\n\n$/, "")
      if (chunk.indexOf("[DONE]") === -1) {
        accumulatedText += chunk
        console.log(accumulatedText)
        const encodeText = options.accumulate ? accumulatedText : chunk
        const queue = encoder.encode(encodeText)
        controller.enqueue(queue)
      } else {
        console.log("were done")
      }
    },
  })

  return transformStream
}
