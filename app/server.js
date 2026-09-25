import fastify from "fastify";

const app = fastify();

// app.get("/", async (request, reply) => {
//   return { hello: "world" };
// });

console.log("Starting server...");
console.log("Process ID:", process.pid);

console.log("Hello from Node");

const users = [];

users.push("Sushil");

console.log("PID:", process.pid);
console.log("Users:", users);

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export default app;
