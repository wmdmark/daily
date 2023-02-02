import { OpenAIStream } from "./stream/OpenAIStream"
import { YAMLToJSONTransform } from "./stream/YAMLToJSONTransform"

const createGPTResposne = (text: string) => {
  return JSON.stringify({
    choices: [
      {
        text
      }
    ]
  })
}

describe("stream tests", () => {
  describe("YAML stream transform", () => {
    beforeEach(() => {})

    it("should enqueue the data in JSON format", () => {})
  })

  describe("Text stream transform", () => {})
})
