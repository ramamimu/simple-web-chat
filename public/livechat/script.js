// var socket = io("http://127.0.0.0:3000");
let socket = io("http://127.0.0.0:3000/livechat");
let name1 = Math.random();
let name2 = Math.random();
let name3 = Math.random();
let rooms = ["room 1", "room 2", "room 3"];
// let Buffer = require("buffer").Buffer;

// let rooms = ["room 1"];

// let rl = document.getElementById("roomlll");
// rooms.forEach((item) => {
//   console.log(item);
//   let item2 = document.createElement("li");
//   item2.innerText = item;
//   rl.appendChild(item);
// });

let fullName = name1 + name2 + name3;
let pickRoom = rooms[Math.floor(Math.random() * 3)];
socket.emit("sarser", { name: fullName, room: pickRoom });

var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", function (e) {
  console.log("MASUK?");
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", function (msg, room, name) {
  console.log(new Date().getTime() + " : " + msg);
  var item = document.createElement("li");
  item.textContent = name + ": " + msg + " ( from room: " + room + " )";
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// socket.on("connection", function () {
// });
