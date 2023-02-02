// deno-lint-ignore-file
export type AIFunctionConfig = {
  name: string
  prompt: string
  settings: any
  input: [string]
  output: string | { [key: string]: string } | any[]
}

export type AIFunctionsConfig = {
  functions: { [key: string]: AIFunctionConfig }
}
