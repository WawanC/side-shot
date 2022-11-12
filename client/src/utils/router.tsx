import { createBrowserRouter } from "react-router-dom";
import GamePage from "../pages/GamePage";
import HomePage from "../pages/HomePage";
import LobbyPage from "../pages/LobbyPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/game", element: <GamePage /> },
  { path: "/lobby", element: <LobbyPage /> }
]);

export default router;
