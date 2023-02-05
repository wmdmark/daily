// curl -X 'POST' \
//   'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream' \
//   -H 'accept: */*' \
//   -H 'xi-api-key: 3cf5482d25ce564a9b492cb536da6d01' \
//   -H 'Content-Type: application/json' \
//   -d '{
//   "text": "hello, this is just a test!"
// }

export const getVoiceStream = async (
  text: string,
  voiceID = "EXAVITQu4vr4xnSDxMaL"
) => {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}/stream`
  const headers = {
    accept: "*/*",
    "xi-api-key": Deno.env.get("ELEVEN_KEY")!,
    "Content-Type": "application/json",
  }
  const body = {
    text: text,
  }

  console.log("url", url, { headers, body })

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })

  // response is audio/mpeg stream
  // we need to soumhow return this as a stream to the client
  // so they can play it

  return response
}
