import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createWorker } from "./sfu";
import { runWebsocketServer } from "./ws";

const port = 3000;

const main = async () => {
  try {
    const server = express();
    server.use(
      cors({
        origin: "http://localhost:5173",
      })
    );

    const httpServer = createServer(server);

    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    const { router } = await createWorker(httpServer);

    await runWebsocketServer(io, router);

    httpServer.listen(port, () => {
      console.log("listening on port", port);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
