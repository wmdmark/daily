import { createHandler } from "https://esm.sh/graphql-sse/lib/use/fetch"
import { GraphQLHTTP } from "https://deno.land/x/gql@1.1.2/mod.ts"
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.2/mod.ts"
import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts"

const typeDefs = gql`
  type Query {
    hello: String
  }
  type Subscription {
    greetings: String
  }
`

const resolvers = {
  Query: {
    hello: () => "world",
  },
  Subscription: {
    greetings: {
      subscribe: async function* () {
        for (const hi of ["Hi", "Bonjour", "Hola", "Ciao", "Zdravo"]) {
          yield { greetings: hi }
        }
      },
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })
const handler = createHandler({ schema })

let httpHandler = GraphQLHTTP<Request>({ schema, graphiql: true })

export default async (req: Request) => {
  const result = await httpHandler(req)
  return result
}
