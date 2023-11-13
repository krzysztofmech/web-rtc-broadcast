import React, { ChangeEvent, RefObject, useEffect, useRef } from "react";
import { useSignalingChannel } from "./useSignalingChannel";
import { Consumer } from "mediasoup-client/lib/Consumer";
interface HomeProps {}

export const Home: React.FC<HomeProps> = ({}) => {
  const {
    connect,
    isConnected,
    consumingTransport,
    producingTransport,
    username,
    setUsername,
    setRoom,
  } = useSignalingChannel();

  const cameraRef: RefObject<HTMLVideoElement> | any = useRef();

  const startProducing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const track = stream.getVideoTracks()[0];

      cameraRef.current.srcObject = stream && cameraRef.current ? stream : null;

      // emits 'produce' event
      const producer = await producingTransport?.produce({
        track,
        encodings: [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });

      console.log("prodcuer", producer);
    } catch (error) {
      console.log("error during producing");
    }
  };

  const startConsuming = async ({
    producerId,
    id,
    rtpParameters,
    appData,
    kind,
  }: Consumer) => {
    try {
      console.log("transport", id, producerId, rtpParameters, appData, kind);

      if (consumingTransport) {
        const consumer = await consumingTransport.consume({
          producerId,
          id,
          rtpParameters,
          appData,
          kind,
        });
        return consumer;
      }
    } catch (error) {
      console.log("error during consuming", error);
    }
  };

  const stopProducing = () => {
    cameraRef.current.srcObject?.getTracks().forEach((track: any) => {
      track.stop();
    });

    cameraRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => {
      if (cameraRef.current && cameraRef.current.srcObject) {
        stopProducing();
      }
    };
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {isConnected ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                width: "100%",
              }}
            >
              <video
                style={{
                  width: "500px",
                  height: "300px",
                  border: "1px solid #646cff",
                  borderRadius: "5px",
                }}
                ref={cameraRef}
                autoPlay
              ></video>

              <video
                style={{
                  width: "500px",
                  height: "300px",
                  border: "1px solid #646cff",
                  borderRadius: "5px",
                }}
              ></video>
            </div>

            <br />
            <div
              style={{
                padding: "5px",
              }}
            >
              <div>
                <input
                  onChange={(e) => {
                    setRoom(e.target.value);
                  }}
                />
                <button
                  onClick={async () => {
                    startProducing();
                  }}
                >
                  Create Room
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setUsername(e.target.value);
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
          </>
        )}
      </div>
    </div>
  );
};
