import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { Socket as TSocket, io } from "socket.io-client";

type SocketProps = {
  children: ReactNode;
};

type SocketContextValue = {
  socket: TSocket;
  isConnected: boolean;
  setIsConnected: Dispatch<SetStateAction<boolean>>;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export const Socket: React.FC<SocketProps> = ({ children }) => {
  const socket = useRef<TSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  if (!socket.current) {
    socket.current = io('http://localhost:3000', {autoConnect: false});
  }

  return (
    <SocketContext.Provider value={{ socket: socket.current, isConnected, setIsConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  return context;
};
