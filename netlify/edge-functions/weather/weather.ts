import type { Context } from "https://edge.netlify.com"
import { getWeather, getWeatherInputData } from "./utils.ts"
import {
  stringify,
  parse as parseYaml,
} from "https://deno.land/std@0.99.0/encoding/yaml.ts"
import { getImage } from "./images.ts"
import { getVoiceStream } from "./audio.ts"
import { cacheByLocationAndTime, getCachedData, getCacheKey } from "./cache.ts"

if (!Deno.env.get("OPENAI_API_KEY")) {
  throw new Error("Missing env var from OpenAI")
}

const OpenAIStream = async (payload: any) => {
  const url = "https://api.openai.com/v1/chat/completions"
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

const getWeatherPrompt = () => {
  return `You are a program takes input about the time, weather and location, and writes an original poem in the stayle of a poet.

output (YAML):
  setting: a <hot|warm|cool|cold|freezing> <early morning|morning|early afternoon|afternoon|late afternoon|early evening|evening|night|late night> in  <description of the location> in the <spring|summer|fall|winter>
  precipitation: <clear|rain|snow|sleet|hail|drizzle|fog|mist|smoke|dust|sand|ash|squalls|tornado>
  sky: <a scientific description of what the sky looks like given the setting, time and precipitation>
  style_of: <poet 1> and <poet 2>
  title: <a nice title for the poem>
  poem: |
    <an elegent, high quality, original poem about the weather conditions, location, mood, and sky>
  credits: This poem was generated just for you on this <weather condition + time of day> using WeatherKit, DALL-E 2, & OpenAI. Built by @wmdmark who, at this hour, is probably <doing something time/weather appropriate but a bit esoteric> and "prompt engineering." The guy seriously needs to <some sarcastic comment about author>.
  done: true
`
}

/*
  poet_style: <the best poet to write a poem about the location, weather, and mood>

  summary: |
    <short, friendly summary of location, time of day, temperature, precipitation, wind, and any other relevent details>
*/

const handleAIStream = async (request: Request, context: Context) => {
  const data = await request.json()
  let result: any = {}

  try {
    result.weather = await getWeather(
      context.geo.latitude!,
      context.geo.longitude!,
      context.geo.timezone!
    )

    if (!result) {
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
    input.weather = getWeatherInputData(result.weather)

    const prompt = getWeatherPrompt()

    const messages = [
      { role: "system", content: prompt },
      { role: "user", content: stringify(input) + "\noutput:" },
    ]

    // console.log(prompt)

    const payload: any = {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.55,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 640,
      stream: true,
      n: 1,
    }

    const readableStream: any = await OpenAIStream(payload)

    const { readable, writable } = new TransformStream()

    // now we want to parse the readable stream and send it to the client
    let yaml = ""
    let gptResult: any = {}
    const transform = new TransformStream({
      transform: (chunk: string, controller) => {
        const lines = getDataLines(chunk)
        lines.forEach((line) => {
          if (line.indexOf("[DONE]") > -1) {
            result = { ...result, ...gptResult }
            // cacheByLocationAndTime(context, result)
            controller.enqueue(`data: [DONE]\n\n`)
          } else {
            const json: string = line.replace("data: ", "").trim()
            try {
              const data = JSON.parse(json)!
              const tokens = data.choices[0].delta.content
              if (tokens) {
                yaml += tokens
              }
              // console.log(yaml)
              try {
                gptResult = parseYaml(yaml)
                // console.log(yaml)
                const msg = `data: ${JSON.stringify(gptResult)}\n\n`
                controller.enqueue(msg)
              } catch {
                // console.log("error parsing YAML")
                // console.log(yaml)
                // we don't care about errors here
                // console.log(error)
              }
            } catch (error) {
              // console.log(error)
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
    console.log(contextPrompt)
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
    const key = getCacheKey(context)
    const cacheData: any = await getCachedData(context)

    const location = {
      city: context.geo.city,
      subdivision: context.geo.subdivision?.name,
      country: context.geo.country?.name,
    }

    // gonna try and fetch the weather here to see if it helps w/ the errors?
    let weather: any = {}
    try {
      weather = await getWeather(
        context.geo.latitude!,
        context.geo.longitude!,
        context.geo.timezone!
      )
    } catch (error) {
      console.log(error)
      weather.error = error.toString()
    }

    const result = {
      key,
      location,
      cacheData,
      weather,
    }

    return new Response(JSON.stringify(result), {
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
