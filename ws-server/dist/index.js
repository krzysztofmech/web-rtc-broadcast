"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const port = 3000;
const app = http_1.default.createServer((_, response) => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain");
    response.end("Hello World");
});
const io = new socket_io_1.Server(app, {
    cors: {
        origin: "*",
    },
});
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.data.username = username;
    next();
});
io.on("connection", async (socket) => {
    socket.join("chat");
    socket.to("chat").emit("joined", socket.data.username);
    socket.on("message", (data) => {
        socket.to("chat").emit("message", data);
    });
    socket.on("disconnect", (id) => {
        console.log(`Client ${id} disconnected`);
    });
});
io.listen(port);
//# sourceMappingURL=index.js.map