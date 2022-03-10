const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {
  cekMemberName,
  cekMemberPass,
  cekRooms,
} = require("./users/databaseMember.js");

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
// global endpoint
// io.on("connection", (socket) => {
//   socket.on("user login", (data, namespace) => {
//     if (data === "admin") {
//       io.of(namespace).emit("user login", true);
//     } else {
//       io.of(namespace).emit("user login", false);
//     }
//   });
//   socket.on("user pass", (data, namespace) => {
//     if (data === "admin") {
//       io.of(namespace).emit("user pass", true);
//     } else {
//       io.of(namespace).emit("user login", false);
//     }
//   });
// });
// namespace
const chatting = io.of("/");
const drawing = io.of("/draw");

chatting.on("connection", (socket) => {
  // console.log("id socket: ", socket.id);
  let pickRoom, fullName;
  socket.on("sarser", (data) => {
    fullName = data.name;
    pickRoom = data.room;
    console.log("get room ", pickRoom);
    socket.join(pickRoom);
  });

  console.log("a user connected in chatting");
  socket.on("disconnect", () => {
    console.log("user disconnected from chating");
  });

  socket.on("chat message", (msg) => {
    console.log("message: " + msg + "( " + fullName + " : " + pickRoom + " )");
    chatting.to(pickRoom).emit("chat message", msg, pickRoom, fullName);
  });
});

drawing.on("connection", (socket) => {
  // console.log("id socket: ", member[0].name);

  let pickRoom, fullName;
  socket.on("sarser", (data) => {
    fullName = data.name;
    pickRoom = data.room;
    console.log("get room ", pickRoom);
    socket.join(pickRoom);
  });

  console.log("a user connected in drawing");
  socket.on("disconnect", () => {
    console.log("user disconnected from drawing");
  });

  socket.on("drawing", (data) => {
    // socket.broadcast.emit("drawing", data);
    // console.log("draw in room: ", pickRoom);
    socket.to(pickRoom).emit("drawing", data);
  });

  socket.on("kudeta", (data) => {
    console.log("emit kudeta masuk: ", pickRoom, data);
    // console.log("emit kudeta masuk");
    // if (data.fullName != fullName) {
    //   btn2.disabled = data.status;
    //   btn.disabled = data.status;
    // }
    drawing.to(pickRoom).emit("informasi", data);
  });
  // io.on("connection", (socket) => {
  socket.on("user login", (data, sid) => {
    console.log("sid di login= ", sid);
    if (cekMemberName(data)) {
      drawing.emit("user login", true, sid);
    } else {
      drawing.emit("user login", false, sid);
    }
  });
  socket.on("user pass", (data, pass, sid) => {
    console.log("sid di pass= ", sid);
    if (cekMemberPass(data, pass)) {
      drawing.emit("user pass", true, sid);
    } else {
      drawing.emit("user pass", false, sid);
    }
  });
  // });
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
