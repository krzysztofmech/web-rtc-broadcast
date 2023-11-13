import { Socket } from "socket.io";
import { Room, TransportProduceInfo, User } from "src/types";
import { users } from "./users";

export const rooms: Map<string, Room> = new Map();

export const updateRooms = async (
  socket: Socket,
  transportInfo: TransportProduceInfo
) => {
  const user = users.get(socket.id);

  if (user) {
    const room = await createRoom(user, transportInfo);
    rooms.set(socket.id, room);
  }
};

export const createRoom = async (
  user: User,
  transportInfo: TransportProduceInfo
) => {
  const room: Room = {
    name: transportInfo.room,
    owner: transportInfo.username,
    producerId: user.producer!.id,
  };
  return room;
};
