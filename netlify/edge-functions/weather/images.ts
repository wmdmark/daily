export const getImage = async (prompt: string) => {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: "512x512",
    }),
  })
  const result = await response.json()
  return result
}
