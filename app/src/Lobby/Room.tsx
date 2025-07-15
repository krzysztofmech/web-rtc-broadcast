import { FC, useEffect, useRef } from "react";
import type { Room as RoomInfo } from "../../../server/src/types";
import { FaUser } from "react-icons/fa";
import { useSfu } from "@/useSfu";
import { ConsumerOptions } from "mediasoup-client/lib/Consumer";
import { WSEvents } from "../../../server/src/constants";

interface RoomProps {
  roomInfo: RoomInfo;
  consumerOptions: ConsumerOptions;
}

export const Room: FC<RoomProps> = ({ roomInfo, consumerOptions }) => {
  const { consume, socket } = useSfu();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      startConsuming();
    }
  }, []);

  const startConsuming = async () => {
    const consumer = await consume(consumerOptions);

    socket.emit(WSEvents.consume);
    if (consumer) {
      const { track } = consumer;
      audioRef.current!.srcObject = new MediaStream([track]);
    } else {
      console.error("Failed to consume media stream");
    }
  };

  if (!roomInfo || !consumerOptions) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <audio ref={audioRef} autoPlay />
        <div className="flex gap-2">
          {roomInfo.participants.map((participant) => (
            <div key={participant} className="flex flex-col items-center gap-2">
              <FaUser />
              {participant}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
