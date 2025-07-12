import React, { ChangeEvent, useState } from "react";
import { useSfu } from "./useSfu";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Lobby } from "./Lobby";
interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
  const { connect, isConnected } = useSfu();

  const [username, setUsername] = useState<string>("");

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        {isConnected ? (
          <Lobby />
        ) : (
          <>
            <Input
              type="text"
              placeholder="Username"
              className="w-1/2"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setUsername(e.target.value);
              }}
            />
            <Button
              disabled={username === ""}
              onClick={() => {
                connect(username);
              }}
            >
              Connect
            </Button>
          </>
        )}
      </div>
    </>
  );
};
