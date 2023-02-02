import { AIFunctionsConfig, loadConfig } from "./config"

import { parse } from "yaml"
import fs from "fs"
import path from "path"
import { createAITransforms } from "./transforms"

let testYaml = fs.readFileSync(
  path.join(__dirname, "./test-config.yaml"),
  "utf8"
)

const partialLessonResp: string = `title: Learn React.js
keywords: React, JavaScript
description: This learning path will teach you the basics of React.js, a popular JavaScript library for building user interfaces.
lessons:
  - title: Introduction to React.js
    keywords: React, JavaScript
    description: Learn the basics of React.js and how to use it to build user interfaces.
    steps:
      - title: Attend React.js Introduction Course
        verb: attend
        description: Learn the fundamentals of React.js and gain an understanding of its core concepts.
      - title: Complete React.js Tutorial
        verb: todo
        description: Complete a tutorial to practice using React.js and build a basic user interface.
      - title: Submit React.js Project
        verb: submit
        description: Submit a project to demonstrate your understanding of React.js and its capabilities.
  - title:`

const partialStepResp: string = `title: Learn React.js
keywords: React, JavaScript
description: This learning path will teach you the basics of React.js, a popular JavaScript library for building user interfaces.
lessons:
  - title: Introduction to React.js
    keywords: React, JavaScript
    description: Learn the basics of React.js and how to use it to build user interfaces.
    steps:
      - title: Attend React.js Introduction Course
        verb: attend
        description: Learn the fundamentals of React.js and gain an understanding of its core concepts.
      - title:`

let config: AIFunctionsConfig = loadConfig(testYaml)

describe("Path AI Tests", () => {
  it("should load functions from YAML config", () => {
    expect(Object.keys(config.functions).length).toBe(4)
    expect(config.functions.path).toBeDefined()
    expect(config.functions.write).toBeDefined()
    expect(config.functions.list).toBeDefined()
  })

  describe("create AI transform functions from config", () => {
    let transforms

    it("creates the transformer", () => {
      transforms = createAITransforms(config)
      expect(transforms).toBeDefined()
      expect(transforms.path).toBeDefined()
      expect(transforms.path.inputTransform).toBeDefined()
      expect(transforms.path.outputTransform).toBeDefined()
      expect(transforms.write).toBeDefined()
      expect(transforms.write.inputTransform).toBeDefined()
      expect(transforms.write.outputTransform).toBeDefined()
    })

    describe("input to prompt transforms", () => {
      it("transforms input into an object prompt", () => {
        let prompt = transforms.path.inputTransform({
          prompt: "Learn React.js"
        })
        expect(prompt).toBeDefined()
        expect(prompt).toContain("prompt: Learn React.js")
        expect(prompt.endsWith("output (yaml):\n")).toBe(true)
      })

      it("transforms input into a text prompt", () => {
        let prompt = transforms.write.inputTransform({
          context: "",
          text: "Learn React.js"
        })
        expect(prompt).toBeDefined()
        expect(prompt).toContain("text: Learn React.js")
        expect(prompt.endsWith("output (text):\n")).toBe(true)
      })

      it("transforms input into a list prompt", () => {
        let prompt = transforms.list.inputTransform({
          title: "Top 5 action movies",
          contents: ["Die Hard", "The Matrix", "Terminator", "The Rock"]
        })
        expect(prompt).toBeDefined()
        expect(prompt).toContain("title: Top 5 action movies")
        expect(prompt.endsWith("output (yaml):\n")).toBe(true)
      })
    })

    describe("output text transform", () => {
      it("transform text input to text output", () => {
        let output = transforms.write.outputTransform("hello")
        expect(output).toBe("hello")
      })
    })

    describe("output list transform", () => {
      it("transform array input to array output", () => {
        let output = transforms.list.outputTransform(["hello", "world"])
        expect(output).toBeDefined()
        expect(output.length).toBe(2)
        expect(output[0]).toBe("hello")
        expect(output[1]).toBe("world")
      })
    })

    describe("output object transform", () => {
      it("transforms empty input data into the proper output data shape", () => {
        const output = transforms.path.outputTransform({})
        expect(output).toBeDefined()
        expect(output.title).toBeDefined()
        expect(output.title).toBe("")
        expect(output.keywords).toBe("")
        expect(output.description).toBe("")
        expect(output.lessons.length).toBe(0)
      })

      it("transforms partial input data into an output data shape", () => {
        let output
        let data = parse(partialLessonResp)
        output = transforms.path.outputTransform(data)
        expect(output.title).toBe("Learn React.js")
        expect(output.lessons).toBeDefined()
        expect(output.lessons.length).toBe(2)
      })

      // it("transforms full input data into an output data shape", () => {
      //   let output
      //   // now complete the partialLessonResp
      //   let fullRespone = partialLessonResp + ` Basics`
      //   let data = parse(fullRespone)
      //   output = transforms.path.outputTransform(data)

      //   expect(output.lessons.length).toBe(2)
      // })
    })
  })
})
