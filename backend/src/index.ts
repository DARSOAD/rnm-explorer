import { makeApp } from "./infrastructure/http/server";

(async () => {
  const app = await makeApp();
  const port = Number(process.env.PORT) || 8000;
  app.listen(port, () => {
    console.log(`✅ HTTP on http://localhost:${port}`);
    console.log(`🚀 GraphQL on http://localhost:${port}/graphql`);
  });
})();
