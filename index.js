const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { cekMemberName, cekMemberPass } = require("./users/databaseMember.js");

// --------------------creating a udp server --------------------

let temp = 0;

setInterval(() => {
  temp += 100;
}, 50);

const pushData = () => {
  // let data = Buffer.allocUnsafe(12);
  // data.writeInt8(105, 0);
  //
  const buff = Buffer.allocUnsafe(32);
  // buff.writeInt32LE(1231, 0);
  // let data = 6969 + temp;
  let data = buff.writeUInt32LE(temp, 0);
  console.log(temp);
  console.log(data);
  buff.write(data.toString(), 0, 32, "utf8");

  return buff;
};

var udp = require("dgram");
let Buffer = require("buffer").Buffer;
const PORT = "1111";
const GROUP = "224.16.32.80";
const HOST = "0.0.0.0";
var mtcast = udp.createSocket("udp4");

mtcast.on("listening", function () {
  var address = mtcast.address();
  console.log(
    "UDP Client listening on " + address.address + ":" + address.port
  );
  mtcast.setBroadcast(true);
  mtcast.setMulticastTTL(64);
  mtcast.addMembership(GROUP, HOST);
});

var news = [
  "Borussia Dortmund wins German championship",
  "Tornado warning for the Bay Area",
  "More rain for the weekend",
  "Android tablets take over the world",
  "iPad2 sold out",
  "Nation's rappers down to last two samples",
];

mtcast.bind(PORT, HOST, () => {
  setInterval(() => {
    var message = Buffer(news[Math.floor(Math.random() * news.length)]);
    // mtcast.send(pushData(), 0, pushData().length, PORT, GROUP, function (err) {
    mtcast.send(message, 0, message.length, PORT, GROUP, function (err) {
      if (err) console.log(err);
      console.log(new Date().getTime() + "\nA: Message sent");
    });
  }, 100);
});

// ------------------- routing socket -----------------------
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/board", (req, res) => {
  res.sendFile(__dirname + "/public/board/board.html");
});
app.get("/livechat", (req, res) => {
  res.sendFile(__dirname + "/public/livechat/livechat.html");
});

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/board"));
app.use(express.static(__dirname + "/public/livechat"));

// namespace
const chatting = io.of("/livechat");
const drawing = io.of("/board");

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

mtcast.on("message", function (message, remote) {
  console.log(
    new Date().getTime() +
      " \nB: From: " +
      remote.address +
      ":" +
      remote.port +
      " - " +
      message
  );
  // const pub = {
  //   msg: message.toString(),
  // };
  chatting.emit("chat message", message.toString(), 5, "sepuluh");
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
