import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import { Peers } from "./types";

export const useSignalingChannel = () => {
  const { socket } = useContext(SocketContext);

  const [isConnected, setIsConnected] = useState<boolean>(false);

  const configuration: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  let peers: Peers = {};

  useEffect(() => {
    return () => {
      socket.removeAllListeners();
      socket.off("disconnect");
    };
  }, []);

  const connect = async (peerId: string) => {
    socket.auth = { peerId };
    socket.connect();
    addEventListeners();
  };

  const disconnect = () => {
    socket.disconnect();
    setIsConnected(false);
  };

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(configuration);

    return peerConnection;
  };

  const addEventListeners = () => {
    socket.on("ready", () => {
      socket.connected && setIsConnected(true);
      console.log("ready");
    });

    socket.on("joined", async (peers) => {
      const peerConnection = createPeerConnection();
      peerConnection.createDataChannel("room");

      if (Object.keys(peers).length > 1) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("message", offer);
      }
      socket.on("message", async (message: any) => {
        if (message.type === "offer") {
          const peerConnection = createPeerConnection();

          const offer = new RTCSessionDescription(message);
          await peerConnection.setRemoteDescription(offer);

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit("message", answer);
        } else if (message.type === "answer") {
          const remoteDesc = new RTCSessionDescription(message);
          await peerConnection.setRemoteDescription(remoteDesc);
        }
      });

      socket.on("icecandidate", async (message: any) => {
        await peerConnection.addIceCandidate(message.candidate);
      });

      peerConnection.addEventListener("icecandidate", ({ candidate }) => {
        if (candidate) {
          socket.emit("icecandidate", { candidate });
        }
      });

      peerConnection.addEventListener("connectionstatechange", () => {
        console.log("connection established");
      });
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
      socket.removeAllListeners();
    });
  };

  return {
    socket,
    isConnected,
    peers,
    connect,
    disconnect,
  };
};
