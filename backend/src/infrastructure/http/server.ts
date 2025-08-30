import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { makeContext, getContainer, type Ctx } from "./context";

export async function makeApp() {
  const app = express();
  const httpServer = http.createServer(app);

  // Obtain resolvers and SDL from loaded modules
  const { sdl, resolvers } = await getContainer();
  const schema = makeExecutableSchema({ typeDefs: sdl, resolvers });

  const apollo = new ApolloServer<Ctx>({
    schema,
    csrfPrevention: false,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await apollo.start();

  app.disable("x-powered-by");
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/graphql", expressMiddleware(apollo, { context: async ({ req }) => makeContext({ req }) }));

  return app;
}

if (require.main === module) {
  makeApp().then((app) => {
    const port = Number(process.env.PORT) || 8000;
    app.listen(port, () => {
      console.log(`✅ HTTP on http://localhost:${port}`);
      console.log(`🚀 GraphQL on http://localhost:${port}/graphql`);
    });
  });
}
