let debug = document.getElementById("debug");
debug.addEventListener("click", function () {
  console.log("MASUK SIH");
});

(function () {
  let socket = io("http://127.0.0.0:3000/draw");
  let globalSocket = io("http://127.0.0.0:3000");
  let canvas = document.getElementsByClassName("whiteboard")[0];
  let colors = document.getElementsByClassName("color");
  let context = canvas.getContext("2d");

  // logic to adding user
  let name1 = Math.random();
  let name2 = Math.random();
  let name3 = Math.random();
  let rooms = ["room 1", "room 2", "room 3"];

  let fullName = name1 + name2 + name3;
  let pickRoom = rooms[Math.floor(Math.random() * 3)];
  // authentification password
  let userName = prompt("Who's there?", "");
  socket.emit("user login", userName, fullName);
  socket.on("user login", (onUname, unameID) => {
    console.log("masukk login " + onUname + " | ", unameID);
    if (onUname && unameID == fullName) {
      let pass = prompt("Password?", "");
      // emit passw
      socket.emit("user pass", userName, fullName);
      socket.on("user pass", (onPass, passID) => {
        console.log("masukk password");
        if (onPass && passID === fullName) {
          // jika pass benar maka diemit
          alert("Welcome!");
          socket.emit("sarser", { name: fullName, room: pickRoom });

          // show current room
          let showRoom = document.getElementById("room");
          showRoom.textContent = fullName + " are in room " + pickRoom + " | ";
        } else if (passID === fullName) {
          alert("Wrong password");
        }
      });
    } else if (unameID == fullName) {
      alert("I don't know you");
    }
  });
  // server listener
  socket.on("drawing", onDrawingEvent);
  socket.on("informasi", function (data) {
    if (data.name != fullName) {
      btn2.disabled = data.status;
      btn.disabled = data.status;
    }
  });

  // get button
  let btn = document.getElementById("kudeta");
  let btn2 = document.getElementById("kudeta2");
  btn.addEventListener("click", (e) => {
    console.log("masuk event listener");
    btn2.disabled = !btn2.disabled;
    socket.emit("kudeta", { name: fullName, status: btn2.disabled });
  });

  // btn2.addEventListener("click", (e) => {
  //   console.log("masuk ", e);
  // });

  let current = {
    color: "black",
  };
  let drawing = false;

  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

  for (let i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", onColorUpdate, false);
  }

  window.addEventListener("resize", onResize, false);
  onResize();

  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
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
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onMouseUp(e) {
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
})();
