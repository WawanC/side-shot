import { createBrowserRouter } from "react-router-dom";
import BotGamePage from "../pages/BotGamePage";
import HomePage from "../pages/HomePage";
import LobbyPage from "../pages/LobbyPage";
import MultiplayerGamePage from "../pages/MultiplayerGamePage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/bot-game", element: <BotGamePage /> },
  { path: "/lobby", element: <LobbyPage /> },
  { path: "/multiplayer-game", element: <MultiplayerGamePage /> }
]);

export default router;
