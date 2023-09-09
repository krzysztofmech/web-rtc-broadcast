import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";

export const useSocketContext = () => {
  const { socket } = useContext(SocketContext);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<any>([]);
  const [users, setUsers] = useState<string[]>([]);
  useEffect(() => {
    socket && isConnected && addEventListeners();
  }, [isConnected]);

  const connect = (username: string) => {
    socket.auth = { username };
    socket.connect();
    setIsConnected(true);
  };

  const disconnect = () => {
    socket.disconnect();
    setIsConnected(false);
  };

  const sendMessage = (message: string) => {
    socket.emit("message", message);
  };
  const addEventListeners = () => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });

    socket.on("user-connected", (username: string) => {
      setUsers([...users, username]);
    });
  };

  return { socket, messages, isConnected, connect, disconnect, sendMessage };
};
