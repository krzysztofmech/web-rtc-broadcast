import React, { ReactNode, createContext } from "react";
import { Socket, io } from "socket.io-client";

type SocketProviderProps = {
  children: ReactNode;
};

type SocketContextProps = {
  socket: Socket;
};

export const SocketContext = createContext({} as SocketContextProps);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket: Socket = io("http://localhost:3000", { autoConnect: false });

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
