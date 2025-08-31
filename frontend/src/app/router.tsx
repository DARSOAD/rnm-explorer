import { createBrowserRouter } from "react-router-dom";
import ListPage from "../features/characters/pages/ListPage";
// DetailPage lo integrarás en el siguiente feature
// import DetailPage from "../features/characters/pages/DetailPage";

export const router = createBrowserRouter([
  { path: "/", element: <ListPage /> },
  // { path: "/character/:id", element: <DetailPage /> },
]);
