import "./App.css";
import { Home } from "./Home";
import { SocketProvider } from "./SocketProvider";

function App() {
  return (
    <SocketProvider>
      <Home />
    </SocketProvider>
  );
}

export default App;
