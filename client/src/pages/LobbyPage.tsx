import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Player from "../interfaces/player";
import socket from "../utils/socket";

const LobbyPage = () => {
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [name, setName] = useState<string>("");
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get-players");

    socket.on("players", (players: Player[]) => {
      console.log(players);
      setPlayerList(players);
    });

    socket.on("start-game", (arg) => {
      setIsStarting(true);
      setTimeout(() => {
        navigate("/multiplayer-game");
      }, 3000);
    });
  }, []);

  const alreadyJoin = useMemo(
    () => !!playerList.find((player) => player.id === socket.id),
    [playerList, socket.id]
  );

  const isLobbyFull = useMemo(() => playerList.length >= 4, [playerList]);

  const isPlayerReady = useMemo(() => {
    const player = playerList.find((player) => player.id === socket.id);
    if (!player) return false;
    return player.isReady;
  }, [playerList]);

  const joinHandler = () => {
    if (name.length <= 0) return;
    socket.emit("join-lobby", name);
    setName("");
  };

  const leaveHandler = () => {
    if (!alreadyJoin) return;
    socket.emit("leave-lobby");
  };

  const toggleReadyHandler = () => {
    if (!alreadyJoin) return;
    socket.emit("toggle-ready-lobby");
  };

  if (isStarting) {
    return (
      <main
        className="w-screen h-screen bg-pink-200
    flex justify-center items-center"
      >
        <p className="text-4xl font-bold">Game is starting...</p>
      </main>
    );
  }

  return (
    <main
      className="w-screen h-screen bg-pink-200
  flex flex-col p-8 items-center gap-8"
    >
      <h1 className="text-6xl font-bold underline">Lobby</h1>
      <ul className="text-4xl font-bold flex flex-col items-center gap-4 list-disc">
        {playerList.length > 0 ? (
          playerList.map((player) => (
            <li
              key={player.id}
              className={`${player.isReady && "text-green-500"}`}
            >
              {player.username}
            </li>
          ))
        ) : (
          <p>No player yet...</p>
        )}
      </ul>
      {alreadyJoin ? (
        <div className="flex gap-4">
          <button
            className={`py-4 px-8 rounded-full 
        font-bold text-4xl hover:bg-white ${
          isPlayerReady ? "bg-red-200" : "bg-green-500"
        }`}
            onClick={toggleReadyHandler}
          >
            {isPlayerReady ? "Cancel" : "Ready"}
          </button>

          <button
            className={`py-4 px-8 rounded-full 
        font-bold text-4xl bg-red-500 hover:bg-white`}
            onClick={leaveHandler}
          >
            Leave
          </button>
        </div>
      ) : isLobbyFull ? (
        <p className="text-4xl">Lobby already full</p>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            className="text-4xl bg-transparent outline-none text-center font-bold"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value.trim())}
          />
          <button
            className={`py-4 px-8 rounded-full 
      font-bold text-4xl ${
        name.length === 0 ? "bg-gray-500" : "bg-pink-500 hover:bg-white"
      }`}
            disabled={name.length === 0}
            onClick={joinHandler}
          >
            Join
          </button>
        </div>
      )}
    </main>
  );
};

export default LobbyPage;
