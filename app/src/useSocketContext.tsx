import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import { Message } from "./types";

export const useSocketContext = () => {
  const { socket } = useContext(SocketContext);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
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
    socket.on("message", ({ message, username }: Message) => {
      setMessages((messages) => [...messages, { message, username }]);
    });
  };

  return { socket, messages, isConnected, connect, disconnect, sendMessage };
};
