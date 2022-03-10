let member = [
  {
    name: "rama",
    pass: "ramahtamah",
  },
  {
    name: "ramah",
    pass: "hadeuhh",
  },
  {
    name: "ramahan",
    pass: "binjaiii",
  },
  {
    name: "ramahanah",
    pass: "duhh",
  },
  {
    name: "rama rama",
    pass: "memme",
  },
  {
    name: "qush qush",
    pass: "hotahe",
  },
  {
    name: "qushhh",
    pass: "iyaa",
  },
  {
    name: "shoyy",
    pass: "hayoo",
  },
  {
    name: "soyjoy",
    pass: "enakk",
  },
  {
    name: "phoenix",
    pass: "nt",
  },
  {
    name: "mobel lejen",
    pass: "fannydarat",
  },
  {
    name: "kokok belog",
    pass: "aduhai",
  },
  {
    name: "TC20",
    pass: "azekk",
  },
  {
    name: "rumah rumahan",
    pass: "apanihh",
  },
  {
    name: "sim salabim",
    pass: "zulap",
  },
];

function cekMemberName(name) {
  let det = false;
  member.forEach((e) => {
    if (e.name == name) det = true;
  });
  return det;
}
function cekMemberPass(uname, pass) {
  let det = false;
  member.forEach((e) => {
    console.log(e.pass + " | " + pass);
    if (e.name == uname && e.pass == pass) det = true;
  });
  return det;
}

module.exports = { cekMemberName, cekMemberPass };
