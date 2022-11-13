import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main
      className="w-screen h-screen bg-pink-200
    flex flex-col justify-center items-center gap-8"
    >
      <h1 className="text-6xl font-bold">Side-Shot</h1>
      <button
        className="bg-pink-500 py-4 px-8 rounded-full 
      font-bold text-4xl hover:bg-white"
        onClick={() => navigate("/bot-game")}
      >
        Play AI
      </button>
      <button
        className="bg-pink-500 py-4 px-8 rounded-full 
      font-bold text-4xl hover:bg-white"
        onClick={() => navigate("/lobby")}
      >
        Multiplayer
      </button>
    </main>
  );
};

export default HomePage;
