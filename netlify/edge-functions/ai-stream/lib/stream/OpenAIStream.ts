// https://github.com/Nutlope/twitterbio/blob/main/utils/OpenAIStream.ts
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "https://unpkg.com/eventsource-parser@0.1.0/dist/index.esm.js"

export interface OpenAIStreamPayload {
  model: string
  prompt: string
  temperature: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  max_tokens: number
  stream: boolean
  n: number
}

export async function OpenAIStream(
  payload: OpenAIStreamPayload
): Promise<ReadableStream> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let counter = 0

  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (res.status !== 200) {
    throw new Error("OpenAI API Error: " + res.statusText)
  }

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].text
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return
            }
            const queue = encoder.encode(text)
            controller.enqueue(queue)
            counter++
          } catch (e) {
            // maybe parse error
            console.log(e)
            controller.error(e)
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse)
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        let res = decoder.decode(chunk)
        // need to check for an error here...

        parser.feed(res)
      }
    },
  })

  return stream
}
