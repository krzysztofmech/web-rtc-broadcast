import { FC } from "react";
import { Button } from "@/components/ui/button";
import { FaUser } from "react-icons/fa";
import { useRooms } from "./useRooms";
import { Room } from "./Room";

interface LobbyProps {}

export const Lobby: FC<LobbyProps> = () => {
  const { room, error, isLoading, joinRoom, joinedRoom, consumerOptions } =
    useRooms();

  if (isLoading) {
    return <>Loading...</>;
  }

  if (error) {
    return <div className="text-red-500">Error loading rooms</div>;
  }

  return (
    <>
      {!joinedRoom && room && (
        <Button variant={"outline"} className="py-4" onClick={() => joinRoom()}>
          <div className="flex flex-col p-4">
            <span>{room.name}</span>
            <div className="flex items-center gap-2">
              <FaUser />
              {room.participants.length}
            </div>
          </div>
        </Button>
      )}

      {joinedRoom && room && consumerOptions && (
        <Room roomInfo={room} consumerOptions={consumerOptions} />
      )}
    </>
  );
};
