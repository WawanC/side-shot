import { RouterProvider } from "react-router-dom";
import useSound from "use-sound";
import router from "./utils/router";

const App = () => {
  // Dummy Sound
  // const _ = useSound("/sounds/flip-card.mp3", {
  //   onunlock: () => {
  //     console.log("sound unlocked");
  //   }
  // });
  // Dummy Sound

  return <RouterProvider router={router} />;
};

export default App;
