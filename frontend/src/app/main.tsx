import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { makeApolloClient } from "../core/config/apollo.factory";
import { router } from "./router";

const client = makeApolloClient({ uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:8000/graphql" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);
