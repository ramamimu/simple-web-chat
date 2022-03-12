let debug = document.getElementById("debug");
debug.addEventListener("click", function () {
  console.log("MASUK SIH");
});

let pencil = true;
let rectangle = false;
let erase = false;
let globalWidth = 50;

(function () {
  let socket = io("http://127.0.0.0:3000/board");
  // let globalSocket = io("http://127.0.0.0:3000");
  let canvas = document.getElementsByClassName("whiteboard")[0];
  let colors = document.getElementsByClassName("color");
  let context = canvas.getContext("2d");

  // logic to adding user
  let name1 = Math.random();
  let name2 = Math.random();
  let name3 = Math.random();
  let rooms = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  let uID = name1 + name2 + name3;
  let pickRoom = rooms[Math.floor(Math.random() * 10)];
  // authentification password
  let userName = prompt("Who's there?", "");
  socket.emit("user login", userName, uID);
  socket.on("user login", (onUname, unameID) => {
    console.log("masukk login " + onUname + " | ", unameID);
    if (onUname && unameID == uID) {
      let pass = prompt("Password?", "");
      // emit passw
      socket.emit("user pass", userName, pass, uID);
      socket.on("user pass", (onPass, passID) => {
        console.log("masukk password");
        if (onPass && passID === uID) {
          // jika pass benar maka diemit
          alert("Welcome!");
          socket.emit("sarser", { name: uID, room: pickRoom });

          // show current room
          let showRoom = document.getElementById("room");
          showRoom.textContent = uID + " are in room " + pickRoom + " | ";
        } else if (passID === uID) {
          alert("Wrong password");
        }
      });
    } else if (unameID == uID) {
      alert("I don't know you");
    }
  });

  // get button
  let btn = document.getElementById("kudeta");
  let btn2 = document.getElementById("kudeta2");
  btn.addEventListener("click", (e) => {
    console.log("masuk event listener");
    btn2.disabled = !btn2.disabled;
    socket.emit("kudeta", { name: uID, status: btn2.disabled });
  });

  // btn2.addEventListener("click", (e) => {
  //   console.log("masuk ", e);
  // });

  let current = {
    color: "black",
  };
  let drawing = false;
  // server listener
  socket.on("drawing", onDrawingEvent);
  socket.on("informasi", function (data) {
    if (data.name != uID) {
      btn2.disabled = data.status;
      btn.disabled = data.status;
      console.log("masuk event ", btn2.disabled);
    }
  });
  // setInterval(function () {
  //   console.log("buttonne iki gaes ", btn2.disabled);
  // }, 1);
  // if (!btn2.disabled) {
  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);
  // }

  for (let i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", onColorUpdate, false);
  }

  window.addEventListener("resize", onResize, false);
  onResize();

  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    erase ? (context.strokeStyle = "white") : (context.strokeStyle = color);
    context.lineWidth = globalWidth;
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    let w = canvas.width;
    let h = canvas.height;

    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
    });
  }

  function onMouseDown(e) {
    // jika kanvas diambil alih oleh orang lain
    if (btn2.disabled && btn.disabled) return;
    if (pencil) drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
    console.log(current.x + "||" + current.y);
    if (rectangle) callRect(current.x, current.y);
  }

  function onMouseUp(e) {
    // jika kanvas diambil alih oleh orang lain
    // console.log(btn2.disabled + "||" + btn.disabled);
    if (btn2.disabled && btn.disabled) return;
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
  }

  function onMouseMove(e) {
    // jika kanvas diambil alih oleh orang lain
    // console.log(btn2.disabled + "||" + btn.disabled);
    if (btn2.disabled && btn.disabled) return;
    if (!drawing) {
      return;
    }
    drawLine(
      current.x,
      current.y,
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY,
      current.color,
      true
    );
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onColorUpdate(e) {
    // jika kanvas diambil alih oleh orang lain
    // console.log(btn2.disabled + "||" + btn.disabled);
    if (btn2.disabled && btn.disabled) return;
    console.log("masuk ganti warna");
    current.color = e.target.className.split(" ")[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return function () {
      let time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    let w = canvas.width;
    let h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  document.getElementById("rectangle").addEventListener("click", () => {
    rectangle = true;
    pencil = false;
    erase = false;
  });
  document.getElementById("pen").addEventListener("click", () => {
    pencil = true;
    rectangle = false;
    erase = false;
  });
  document.getElementById("erase").addEventListener("click", () => {
    erase = true;
    rectangle = false;
    pencil = true;
  });
  document.getElementById("range").addEventListener("click", (e) => {
    // console.log(document.getElementById("range").value);
    globalWidth = document.getElementById("range").value;
  });

  function callRect(xPoint, yPoint) {
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
      var ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.fillStyle = current.color;
      ctx.fillRect(xPoint, yPoint, globalWidth, globalWidth);
      ctx.stroke();
    }
  }
})();
