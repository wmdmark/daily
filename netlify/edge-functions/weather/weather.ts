import type { Context } from "https://edge.netlify.com"
import { getWeather, getWeatherInputData } from "./utils.ts"
import {
  stringify,
  parse as parseYaml,
} from "https://deno.land/std@0.99.0/encoding/yaml.ts"
import { getImage } from "./images.ts"
import { getVoiceStream } from "./audio.ts"

if (!Deno.env.get("OPENAI_API_KEY")) {
  throw new Error("Missing env var from OpenAI")
}

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
    console.log(openAiResponse)
    throw new Error("OpenAI error")
  }

  return openAiResponse.body
}

const getDataLines = (chunk: string) => {
  // lines start with data: and end with \n\n
  let lines = chunk.split("\n\n").filter((line) => line.trim().length > 0)
  return lines
}

const indentLines = (lines: string) => {
  return lines
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")
}

const getWeatherPrompt = (input: any) => {
  return `This program takes input about the time, weather and location, and writes a poem.

Output in the following YAML structure:
  sky: <describe the sky looks like right now to an observer right now>
  preamble: <write a short summary of the location, time of day, weather, and mood>.
  poet: <the best poet to write a poem about the location, weather, and mood>
  delay: one two three four five <count to twenty>
  title: <a poetic title for the poem>
  poem: |
    <a high quality poem about the weather, location, mood, and sky by the poet>
  credits: This poem was created for you on this <weather condition + time of day> using WeatherKit (weather data), DALL-E 2 (background image), GPT-3 (writing) and IIElevenLabs (speech). Built by @wmdmark who, at this hour, is probably <doing something time/weather appropriate but a bit esoteric> and "prompt engineering." The guy seriously needs to <some sarcastic comment about author>.
  summary: <short, friendly summary of location, time of day, temperature, precipitation, wind, and any other relevent details>
  done: true

input:
${indentLines(stringify(input))}

output (YAML):
`
}

const handleAIStream = async (request: Request, context: Context) => {
  const data = await request.json()

  try {
    const weather = await getWeather(
      context.geo.latitude!,
      context.geo.longitude!,
      context.geo.timezone!
    )

    if (!weather) {
      console.log("No weather data??", weather)
      throw new Error("No weather data")
    }

    const input: any = {}
    input.timezone = context.geo.timezone
    input.localTime = data.localDateTime
    // input.time = weatherInput.current.readTime
    input.location = {
      city: context.geo.city,
      state: context.geo.subdivision?.name,
      country: context.geo.country?.name,
    }
    input.weather = getWeatherInputData(weather)

    const prompt = getWeatherPrompt(input)

    // console.log(prompt)

    const payload: any = {
      model: "text-davinci-003",
      prompt,
      temperature: 0.4,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 420,
      stream: true,
      n: 1,
    }

    const readableStream: any = await OpenAIStream(payload)

    const { readable, writable } = new TransformStream()

    // now we want to parse the readable stream and send it to the client
    let yaml = ""
    const transform = new TransformStream({
      transform: (chunk: string, controller) => {
        const lines = getDataLines(chunk)
        lines.forEach((line) => {
          if (line.indexOf("[DONE]") > -1) {
            controller.enqueue(`data: [DONE]\n\n`)
          } else {
            const json: string = line.replace("data: ", "").trim()
            try {
              const data = JSON.parse(json)!
              const tokens = data.choices[0].text
              if (tokens.indexOf("[DONE]") > -1) {
                controller.enqueue(`data: [DONE]\n\n`)
              } else {
                yaml += tokens
                try {
                  const data = parseYaml(yaml)
                  const msg = `data: ${JSON.stringify(data)}\n\n`
                  controller.enqueue(msg)
                } catch {
                  // console.log("error parsing YAML")
                  // console.log(yaml)
                  // we don't care about errors here
                  // console.log(error)
                }
              }
            } catch (error) {
              console.log(error)
            }
          }
        })
      },
    })

    readableStream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(transform)
      .pipeThrough(new TextEncoderStream())
      .pipeTo(writable)

    return new Response(readable as unknown as BodyInit, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.log(error)
    return new Response("Could not get weather", { status: 500 })
  }
}

const handleGetRequest = async (request: Request, context: Context) => {
  // TODO: gen an image from Dall-e
  // get the prompt from the url
  const url = new URL(request.url)
  if (url.searchParams.get("img")) {
    const prompt = url.searchParams.get("img")
    const contextPrompt = `A beautiful sky image, highly realistic, smooth, ambient. ${prompt} 5k cinematic still.`
    const result = await getImage(contextPrompt)
    if (!result) {
      return new Response("No image found", { status: 404 })
    }
    return new Response(JSON.stringify(result), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } else if (url.searchParams.get("location")) {
    const location = {
      city: context.geo.city,
      subdivision: context.geo.subdivision?.name,
      country: context.geo.country?.name,
    }

    return new Response(JSON.stringify(location), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } else if (url.searchParams.get("lat") && url.searchParams.get("lng")) {
    const lat = url.searchParams.get("lat")!
    const lng = url.searchParams.get("lng")!
    const result = await getWeather(lat, lng, context.geo.timezone!)

    if (!result.ok) {
      return new Response("Could not load weather", { status: result.status })
    }

    return new Response(JSON.stringify(result), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    })
  } else if (url.searchParams.get("say")) {
    const text = url.searchParams.get("say")!
    return getVoiceStream(text)
  }
}

export default (request: Request, context: Context) => {
  if (request.method === "POST") {
    return handleAIStream(request, context)
  } else if (request.method === "GET") {
    return handleGetRequest(request, context)
  }
  return new Response("Not found", { status: 404 })
}
