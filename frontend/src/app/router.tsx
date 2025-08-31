import { createBrowserRouter } from "react-router-dom";
import CharacterExplorerPage from "../features/characters/pages/CharacterExplorerPage";

export const router = createBrowserRouter([
  { path: "/", element: <CharacterExplorerPage /> }
]);
