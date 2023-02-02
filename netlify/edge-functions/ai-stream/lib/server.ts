import { AIFunctionConfig, loadFunctionConfig } from "./config"
import { Request, Response } from "express"
import { validateInput } from "./transforms/input"
import { OpenAIStream, OpenAIStreamPayload } from "./stream/OpenAIStream"
import { createAITransform } from "./transforms"
import { WritableStream } from "stream/web"
import * as dotenv from "dotenv"
import { YAMLToJSONTransform } from "./stream/YAMLToJSONTransform"
import { TextTransform } from "./stream/TextTransform"
dotenv.config()

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required in environment")
}

const getFunctionInput = (req: Request) => {
  const params: any = req.query
  const input = Object.keys(params).reduce((acc, key) => {
    if (key !== "fn") {
      acc[key] = params[key]
    }
    return acc
  }, {})
  return input
}

const ResponseStream = (res: Response) => {
  return new WritableStream({
    write(chunk) {
      res.write(chunk)
    },
    close() {
      res.end()
    }
  })
}

export const createAIExpressHandler = (functionsConfigPath: string) => {
  let config = loadFunctionConfig(functionsConfigPath)

  return async (req: Request, res: Response) => {
    if (req.method === "OPTIONS") {
      res.sendStatus(200)
    }

    const params: any = req.query

    const fnName = params.fn
    const input = getFunctionInput(req)

    if (!fnName || !config[fnName]) {
      res.status(400).send("No function found")
      return
    }

    const functionConfig: AIFunctionConfig = config[fnName]
    const functionTransform = createAITransform(functionConfig)

    console.log("input", { input, functionConfig })

    try {
      validateInput(input, functionConfig)
      let prompt: string = functionTransform.inputTransform(input)
      console.log(prompt)
      let payload: OpenAIStreamPayload = {
        model: "text-davinci-003",
        temperature: 0.3,
        max_tokens: 1200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        n: 1,
        prompt,
        ...functionConfig.settings
      }
      let openAIStream = await OpenAIStream(payload)

      // write the readable stream to the response
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Connection", "keep-alive")
      res.flushHeaders() // flush the headers to establish SSE with client

      const outputTransform =
        typeof functionConfig.output === "object"
          ? YAMLToJSONTransform({ fn: functionConfig })
          : TextTransform()

      openAIStream.pipeThrough(outputTransform).pipeTo(ResponseStream(res))

      return res
    } catch (err) {
      console.log("err", err)
      res.status(400).send(err.message)
    }
  }
}
