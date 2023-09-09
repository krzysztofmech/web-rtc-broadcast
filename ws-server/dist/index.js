import Fastify from "fastify";
import fastifyIO from "fastify-socket.io";
const port = 3000;
const server = Fastify({ logger: true });
server.register(fastifyIO, {
    cors: {
        origin: "*",
    },
});
server.get("/", (_, reply) => {
    reply.send({ hello: "world" });
});
server.ready().then(() => {
    server.io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        if (!username) {
            return next(new Error("invalid username"));
        }
        socket.data.username = username;
        next();
    });
    server.io.on("connection", (socket) => {
        socket.join("chat");
        socket.on("message", (message) => {
            server.io
                .to("chat")
                .emit("message", { message, username: socket.data.username });
        });
        socket.on("disconnect", (id) => {
            console.log(`Client ${id} disconnected`);
        });
        console.log("connected", socket.data.username);
    });
});
server.listen({ port }, (err) => {
    if (err) {
        server.log.error(err);
    }
});
//# sourceMappingURL=index.js.map