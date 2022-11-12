import { useState } from "react";

const LobbyPage = () => {
  const [playerList, setPlayerList] = useState(["test"]);
  const [name, setName] = useState<string>("");

  return (
    <main
      className="w-screen h-screen bg-pink-200
  flex flex-col p-8 items-center gap-8"
    >
      <h1 className="text-6xl font-bold underline">Lobby</h1>
      <ul className="text-4xl font-bold flex flex-col items-center gap-4 list-disc">
        {playerList.length > 0 ? (
          <>
            <li>Player A</li>
            <li>Player B</li>
            <li>Player C</li>
            <li>Player D</li>
          </>
        ) : (
          <p>No player yet...</p>
        )}
      </ul>
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
        >
          Join
        </button>
      </div>
    </main>
  );
};

export default LobbyPage;
