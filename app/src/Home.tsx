import React, { ChangeEvent, useState } from "react";
import { useSocketContext } from "./useSocketContext";

interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const { socket, messages, isConnected, connect, disconnect, sendMessage } =
    useSocketContext();

  return (
    <div>
      <h1>Socket.io</h1>
      {isConnected ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              e.target.value && setMessage(e.target.value);
            }}
          />
          <br />

          <button
            onClick={() => {
              sendMessage(message);
            }}
          >
            Send message
          </button>
          <br />

          <button
            onClick={() => {
              disconnect();
            }}
          >
            Leave room
          </button>
          <br />

          <div>
            {messages.map((user: any, index: number) => (
              <p key={index}>{user}</p>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              e.target.value && setUsername(e.target.value);
            }}
          />
          <br />
          <button
            disabled={username === ""}
            onClick={() => {
              connect(username);
            }}
          >
            Connect
          </button>
        </div>
      )}
    </div>
  );
};
