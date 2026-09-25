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

app.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});


const users = new Map();

function sendUsers() {
  const userList = Array.from(users.entries()).map(([socketId, user]) => ({
    socketId,
    username: user.username,
  }));

  io.emit("users", userList);
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1. Specific client
//   socket.on("private_test", (message) => {
//     console.log(message,'data')
//     socket.emit("private_response", {
//       from: "server",
//       message: message + ' private response',
//     });
//   });

//   // 2. Everyone except sender
//   socket.on("broadcast_test", (data) => {
//     socket.broadcast.emit("broadcast_response", {
//       from: socket.id,
//       message: data.message,
//     });
//   });

//   // 3. Everyone including sender
//   socket.on("global_test", (data) => {
//     io.emit("global_response", {
//       from: socket.id,
//       message: data.message,
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });


console.log("Client connected:", socket.id);

socket.on("join", ({ username }) => {
  users.set(socket.id, {
    username,
  });

  console.log("User joined:", username, "Socket:", socket.id);
  console.log(users)
  sendUsers();
});


socket.on("private_message", ({ to, message }) => {
    io.to(to).emit("private_message", {
      senderId: socket.id,
      message,
      timestamp: Date.now(),
    });
  });

socket.on("disconnect", () => {
  users.delete(socket.id);
  sendUsers();
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
