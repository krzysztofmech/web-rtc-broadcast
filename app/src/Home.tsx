import React, { ChangeEvent, useState } from "react";
import { useSignalingChannel } from "./useSignalingChannel";

interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
  const [username, setUsername] = useState("");
  const { connect, isConnected } = useSignalingChannel();

  return (
    <div>
      <h1>room 1</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {isConnected ? (
          <></>
        ) : (
          <>
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
              Join room
            </button>
          </>
        )}
      </div>
    </div>
  );
};
