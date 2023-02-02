import { AIFunctionConfig } from "../config.ts"
import { stringify } from "https://deno.land/std@0.63.0/encoding/yaml.ts"

const indentLines = (lines: string, indent: string = "  ") => {
  return lines
    .split("\n")
    .map((line) => indent + line)
    .join("\n")
}

export const createInputTransform = (
  fn: AIFunctionConfig
): ((input: { [key: string]: string | number }) => string) => {
  let basePrompt: string = `${fn.prompt}`
  basePrompt += `Given the following inputs:\n`
  basePrompt += stringify(fn.input) + `\n`

  let outputType = typeof fn.output === "string" ? "text" : "yaml"

  basePrompt +=
    outputType === "yaml"
      ? `Respond with the following YAML output:\n`
      : `Respond with the following text output:`
  if (outputType === "yaml") {
    basePrompt += indentLines(stringify(fn.output)) + `\n`
  } else {
    basePrompt += fn.output + `\n`
  }

  return (input: { [key: string]: string | number }) => {
    validateInput(input, fn)

    let prompt = basePrompt
    prompt += `input:\n`
    prompt += indentLines(stringify(input)) + `\n`

    // let outputFormat: string = typeof fn.output === "string" ? "text" : "yaml"

    prompt += `output:\n`
    return prompt
  }
}

export const validateInput = (input: any, fn: AIFunctionConfig) => {
  fn.input.forEach((key: string) => {
    if (typeof input[key] === "undefined") {
      throw new Error(`Missing input key: ${key}`)
    }
  })
}
