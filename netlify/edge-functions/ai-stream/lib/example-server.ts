import express from "express"
import { createAIExpressHandler } from "./server"
import path from "path"
const app = express()
const port = 8000

const handler = createAIExpressHandler(
  path.join(__dirname, "./test-config.yaml")
)

app.get("/ai", handler)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
