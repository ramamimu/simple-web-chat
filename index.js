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

// let name1 = Math.random();
// let name2 = Math.random();
// let name3 = Math.random();
// let fullName = name1 + name2 + name3;
// let pickRoom = rooms[Math.floor(Math.random() * 3)];
// let coba = io();
// coba.emit("iseng", "anjasss");

io.on("connection", (socket) => {
  // let name1 = Math.random();
  // let name2 = Math.random();
  // let name3 = Math.random();
  // let fullName = name1 + name2 + name3;
  // const userId = await fetchUserId(socket);
  // let pickRoom = rooms[Math.floor(Math.random() * 3)];
  // socket.join(userId);
  let pickRoom, fullName;
  socket.on("sarser", (data) => {
    fullName = data.name;
    pickRoom = data.room;
    console.log("get room ", pickRoom);
    socket.join(pickRoom);
  });
  // and then later
  // io.to(userId).emit("hi");
  console.log("a user connected");
  // socket.on("iseng", (data) => {
  //   console.log(data, " awowkaowkwo");
  // });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  // let room = pickRoom;

  socket.on("chat message", (msg) => {
    console.log("message: " + msg + "( " + fullName + " : " + pickRoom + " )");
    io.to(pickRoom).emit("chat message", msg, pickRoom, fullName);
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

// LOGIC
// bedakan ketika server di board sama message

// const orderNamespace = io.of("/orders");

// orderNamespace.on("connection", (socket) => {
//   socket.join("room1");
//   orderNamespace.to("room1").emit("hello");
// });

// const userNamespace = io.of("/users");

// userNamespace.on("connection", (socket) => {
//   socket.join("room1"); // distinct from the room in the "orders" namespace
//   userNamespace.to("room1").emit("holà");
// });
