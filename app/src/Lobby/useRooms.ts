import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/api";
import { Room } from "../../../server/src/types";
import { WSEvents } from "../../../server/src/constants";
import { useRef, useState } from "react";
import { useSfu } from "@/useSfu";
import { ConsumerOptions } from "mediasoup-client/lib/Consumer";

export const useRooms = () => {
  const { device, socket } = useSfu();

  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR<Room>("/rooms", fetcher);

  const [joinedRoom, setJoinedRoom] = useState(false);
  const consumerOptionsRef = useRef<ConsumerOptions | null>(null);

  socket.on(WSEvents.roomUpdated, (room: Room) => {
    mutate("/rooms");
  });

  socket.on(WSEvents.joinedRoom, async (consumerOptions: ConsumerOptions) => {
    setJoinedRoom(true);
    consumerOptionsRef.current = consumerOptions;
  });

  const joinRoom = () => {
    if (!device) {
      console.error("Device not initialized");
      return;
    }

    socket.emit(WSEvents.joinRoom, {
      rtpCapabilities: device.rtpCapabilities,
    });

  };

  return {
    room: data,
    error,
    isLoading,
    joinRoom,
    joinedRoom,
    consumerOptions: consumerOptionsRef.current,
  };
};
