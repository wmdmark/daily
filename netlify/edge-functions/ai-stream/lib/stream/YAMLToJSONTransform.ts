import { parse } from "https://deno.land/std@0.63.0/encoding/yaml.ts"
import { getDataLines } from "../../ai-stream.ts"
import { AIFunctionConfig } from "../config.ts"
import { AITransform, createAITransform } from "../transforms/index.ts"

export interface ObjectStreamPayload {
  fn: AIFunctionConfig
}

export function YAMLToJSONTransform(options: ObjectStreamPayload) {
  let yaml = ""
  let data: any = {}
  const transform: AITransform = createAITransform(options.fn)

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      let text = chunk

      text = text.replace(/^data: /, "")
      // remove trailing newlines
      text = text.replace(/\n\n$/, "")

      if (text.indexOf("[DONE]") === -1) {
        yaml += text

        try {
          data = parse(yaml)
          // console.log(yaml)
          data = transform.outputTransform(data)
          const payload = JSON.stringify(data)
          const queue = `${payload}`
          controller.enqueue(queue)
        } catch (e) {
          // we expect this to fail when the yaml is incomplete
          // console.log(e)
          console.log("--- error parsing yaml ---")
          console.log(yaml)
          console.log("---")
          console.log(e)
          console.log("---")
        }
      } else {
        controller.enqueue(`data: [DONE]\n\n`)
      }
    },
  })

  return transformStream
}
