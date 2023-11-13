import { Socket } from "socket.io";
import { UserTransport, User } from "src/types";

export const users: Map<string, User> = new Map();

export const updateUsers = async (
  socket: Socket,
  producingTransport: UserTransport,
  consumingTransport: UserTransport
) => {
  const user = await createUser(socket, producingTransport, consumingTransport);
  users.set(user.id, user);

  return user;
};

export const createUser = async (
  socket: Socket,
  producingTransport: UserTransport,
  consumingTransport: UserTransport
) => {
  const user: User = {
    id: socket.id,
    transports: [producingTransport, consumingTransport],
  };

  return user;
};
