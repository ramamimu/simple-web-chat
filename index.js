const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// server and routing
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/draw", (req, res) => {
  res.sendFile(__dirname + "/public/board/index.html");
});
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/board"));

// rooms and event
let rooms = ["room 1", "room 2", "room 3"];

io.on("connection", async (socket) => {
  let name1 = Math.random();
  let name2 = Math.random();
  let name3 = Math.random();
  let fullName = name1 + name2 + name3;
  // const userId = await fetchUserId(socket);
  let pickRoom = rooms[Math.floor(Math.random() * 3)];
  // socket.join(userId);
  console.log("get room ", pickRoom);
  // and then later
  // io.to(userId).emit("hi");
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  let room = pickRoom;
  socket.join(room);
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    io.to(room).emit("chat message", msg, room, fullName);
  });
  // socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
  socket.on("drawing", (data) => {
    // console.log("saya lagi menggambar");
    socket.broadcast.emit("drawing", data);
  });
});

server.listen(3000, () => {
  console.log("listening on http://127.0.0.0:3000");
});
