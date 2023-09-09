import React, { ChangeEvent, useState } from "react";
import { useSocketContext } from "./useSocketContext";
import { Message } from "./types";

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
              setMessage("");
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
            {messages.map(({ message, username }, index: number) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  borderBottom: "1px solid gray",
                }}
              >
                <div style={{ color: "gray" }}>{username}</div>
                <div>{message}</div>
              </div>
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
