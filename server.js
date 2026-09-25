import Fastify from "fastify";
import { Server } from "socket.io";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";


const app = Fastify({
  logger: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await app.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
});

const io = new Server(app.server, {
  cors: {
    origin: "*",
  },
});

app.get("/", async () => {
  return {
    message: "Chat server is running",
  };
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1. Specific client
  socket.on("private_test", (message) => {
    console.log(message,'data')
    socket.emit("private_response", {
      from: "server",
      message: message + ' private response',
    });
  });

  // 2. Everyone except sender
  socket.on("broadcast_test", (data) => {
    socket.broadcast.emit("broadcast_response", {
      from: socket.id,
      message: data.message,
    });
  });

  // 3. Everyone including sender
  socket.on("global_test", (data) => {
    io.emit("global_response", {
      from: socket.id,
      message: data.message,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.listen(
  {
    port: 3000,
    host: "0.0.0.0",
  },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  },
);
