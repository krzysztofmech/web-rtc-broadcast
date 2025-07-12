import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Core } from "./Core";

const port = 3000;

const main = async () => {
  try {
    const app = express();
    app.use(
      cors({
        origin: "http://localhost:5173",
      }),
    );

    const httpServer = createServer(app);
    new Core(httpServer, app);

    httpServer.listen(port, () => {
      console.log("listening on port", port);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
