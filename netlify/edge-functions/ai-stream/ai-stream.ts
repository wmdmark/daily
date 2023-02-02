import type { Context } from "https://edge.netlify.com"
import { parse as parseYaml } from "https://deno.land/std@0.63.0/encoding/yaml.ts"
import { createAITransforms } from "./lib/transforms/index.ts"
import { YAMLToJSONTransform } from "./lib/stream/YAMLToJSONTransform.ts"
import { AIFunctionsConfig } from "./lib/config.ts"
import { getWeather, getWeatherInputData } from "./weather.ts"

if (!Deno.env.get("OPENAI_API_KEY")) {
  throw new Error("Missing env var from OpenAI")
}
const __dirname = new URL(".", import.meta.url).pathname
const path = __dirname + "functions.yaml"
const yamlConfig = Deno.readTextFileSync(path)

const config: AIFunctionsConfig = parseYaml(yamlConfig)

const functionTransforms = createAITransforms(config)

const OpenAIStream = async (payload: any) => {
  const url = "https://api.openai.com/v1/completions"
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
  }

  const body = JSON.stringify(payload)

  const openAiResponse = await fetch(url, {
    method: "POST",
    headers,
    body,
  })

  if (!openAiResponse.ok) {
    return new Response("OpenAI error", { status: 500 })
  }

  return openAiResponse.body
}

const OpenAITransform = new TransformStream({
  transform: (chunk: string, controller) => {
    const lines = getDataLines(chunk)
    lines.forEach((line) => {
      if (line.indexOf("[DONE]") > -1) {
        controller.enqueue(`data: [DONE]\n\n`)
      } else {
        const json: string = line.replace("data: ", "").trim()
        try {
          const data: any = JSON.parse(json)!
          const tokens = data.choices[0].text
          if (tokens.indexOf("[DONE]") > -1) {
            controller.enqueue(`data: [DONE]\n\n`)
          } else {
            const msg = `data: ${tokens}\n\n`
            controller.enqueue(msg)
          }
        } catch (error) {
          console.log(error)
        }
      }
    })
  },
})

export const getDataLines = (chunk: string) => {
  // lines start with data: and end with \n\n
  const lines = chunk.split("\n\n").filter((line) => line.trim().length > 0)
  return lines
}

export default async (request: Request, context: Context) => {
  const { timezone, latitude, longitude } = context.geo
  console.log(context)

  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    })
  } else if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  // get data from POST body
  const data = await request.json()
  console.log(data)

  const fnName = data.fn

  if (!fnName || !config.functions[fnName]) {
    return new Response("No function name in the request", { status: 400 })
  }

  if (!latitude || !longitude) {
    return new Response("Missing lat or lon", { status: 400 })
  }

  // TODO: get the weather here
  const weather = await getWeather(
    latitude,
    longitude,
    timezone || "America/New_York"
  )
  console.log("got weather", weather)
  const weatherInput = getWeatherInputData(weather)

  // const isValid = validateInput(input, config.functions[fnName].input)
  // if (!isValid) {
  //   return new Response("Invalid input", { status: 400 })
  // }
  const input = Object.keys(data).reduce((acc: any, key: string) => {
    if (key !== "fn") {
      acc[key] = data[key]
    }
    return acc
  }, {})
  input.timezone = timezone
  // input.time = weatherInput.current.readTime
  input.location = {
    city: context.geo.city,
    state: context.geo.subdivision?.name,
    country: context.geo.country?.name,
  }
  input.weather = weatherInput.current

  const functionTransform = functionTransforms[fnName]
  const prompt = functionTransform.inputTransform(input)
  console.log(prompt)
  const payload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.33,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  }

  const readableStream: any = await OpenAIStream(payload)
  const { readable, writable } = new TransformStream()

  readableStream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(OpenAITransform)
    // .pipeThrough(new TextEncoderStream())
    .pipeThrough(YAMLToJSONTransform({ fn: config.functions[fnName] }))
    .pipeThrough(new TextEncoderStream())
    .pipeTo(writable)

  return new Response(readable as unknown as BodyInit, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  })
}
