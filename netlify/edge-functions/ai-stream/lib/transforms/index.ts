import { createInputTransform } from "./input.ts"
import { transformOutput } from "./output.ts"
import { AIFunctionConfig, AIFunctionsConfig } from "../config.ts"

// TODO: Seems like this should just be a normal `TransformStream`
export type AITransform = {
  fn: AIFunctionConfig
  // transforms input into a prompt
  inputTransform: (input: { [key: string]: string | number }) => string
  // transforms output into any other format
  outputTransform: (data: any) => object | string | Array<any>
}

export const createAITransform = (fn: AIFunctionConfig): AITransform => {
  let transform: AITransform | any = {}
  transform.fn = fn
  transform.inputTransform = createInputTransform(fn)
  transform.outputTransform = (data: any) => transformOutput(fn, data)
  return transform
}

export const createAITransforms = (
  config: AIFunctionsConfig
): { [key: string]: AITransform } => {
  // this takes a config yaml and returns functions that create AI prompts from input mapped to the proper output

  const functions = config.functions
  let handlers: { [key: string]: AITransform } = {}

  Object.keys(functions).forEach((key: string) => {
    const fn = functions[key]
    fn.name = key
    handlers[fn.name] = createAITransform(fn)
  })

  return handlers
}
