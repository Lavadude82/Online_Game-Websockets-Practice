// import required modules
let crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const app = express();
const ws = require("ws");
const server = new ws.Server({ port: 5480 });
const port = 5500;

// function to generate a random key of a given length
function generate_key(length) {
  return crypto.randomBytes(length).toString("base64");
}

// function to host files from a given directory
function HostDir(directory, setHTML, HTMLaltPath) {
  // read the contents of the directory
  fs.readdirSync(__dirname + directory).forEach((e, i) => {
    // if the file is not index.html
    if (e != "index.html") {
      // create a route to serve the file
      app.get(`${directory}${e}`, (req, res) => {
        res.sendfile(__dirname + `${directory}${e}`);
      });
      console.log("hosting " + directory + e);
    } else {
      // if setHTML is true
      if (setHTML === true) {
        // if an alternate path for index.html is provided
        if (HTMLaltPath != undefined && HTMLaltPath != null) {
          // create a route to serve index.html at the alternate path
          app.get(`${HTMLaltPath}`, (req, res) => {
            res.sendfile(__dirname + `${directory}${e}`);
          });
          console.log("hosting " + directory + e + " on " + HTMLaltPath);
        } else {
          // create a route to serve index.html at the root path
          app.get(`/`, (req, res) => {
            res.sendfile(__dirname + `${directory}${e}`);
          });
          console.log("hosting " + directory + e);
        }
      }
    }
  });
}

// template for player data
const template = {
  username: "",
  pos: { x: 0, y: 0 },
};
let players = [];

// handle new connections to the WebSocket server
server.on("connection", function connection(ws) {
  const p_id = players.length;
  players[p_id] = template;

  // handle incoming messages from the client
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    if (message != "user") {
      const data = JSON.parse(message);
      players[p_id] = template;
      players[p_id].username = data.username;
      players[p_id].pos = data.pos;
    }

    ws.send(JSON.stringify({ id: p_id }));
  });

  // handle disconnections from the WebSocket server
  server.on("close", function close() {
    console.log(`${players[p_id].username} disconnected`);
    players.splice(p_id, 1);
  });
});

// host files from various directories
HostDir("/web-ui/home/", true, "/");
HostDir("/web-ui/game/", true, "/game");
HostDir("/web-ui/signin/", true, "/signin");
HostDir("/web-ui/signup/", true, "/signup");
HostDir("/web-ui/chat/", true, "/chat");
// route to handle user signup
app.get("/signup/user", (req, res) => {
  // get the username and password from the query parameters
  const user = req.query.user;
  const password = req.query.pass;
  let taken = false;

  // read and parse the contents of the accounts.db.json file
  let JSON_DAT = JSON.parse(fs.readFileSync(__dirname + "/accounts.db.json"));
  // test if username taken
  JSON_DAT.forEach((e, i) => {
    if (e.username == user) {
      taken = true;
    }
  });
  // redirect the user to the signin page if the username isn't taken
  if (taken == true) {
    return res.send(JSON.stringify({ error: "Username Taken" }));
  } else {
    JSON_DAT.push({ username: user, password: password });
    fs.writeFileSync(__dirname + "/accounts.db.json", JSON.stringify(JSON_DAT));
    return res.send(JSON.stringify({ error: `Created ${user}!` }));
  }
});

// route to handle user signin
app.get("/signin/user", (req, res) => {
  const user = req.query.user;
  const password = req.query.pass;
  let userID = null;
  let JSON_DAT = JSON.parse(fs.readFileSync(__dirname + "/accounts.db.json"));
  JSON_DAT.forEach((e, i) => {
    if (e.username == user && e.password == password) {
      userID = i;
    }
  });
  if (userID == null) {
    return res.send(
      JSON.stringify({ error: "Wrong Password or Non-Existing User" })
    );
  } else {
    return res.send(
      JSON.stringify({
        error: `Logged in as ${user}!`,
        username: user,
        password: password,
      })
    );
  }
});
app.get("/chat-recieve", (req, res) => {
  let JSON_DAT = JSON.parse(fs.readFileSync(__dirname + "/msg.logs.json"));
  if (req.query.msg != null && req.query.msg != undefined) {
    let userID = null;
    let JSON_DAT2 = JSON.parse(
      fs.readFileSync(__dirname + "/accounts.db.json")
    );
    let user = req.query.user;
    let password = req.query.password;
    JSON_DAT2.forEach((e, i) => {
      if (e.username == user && e.password == password) {
        userID = i;
      }
    });
    if (userID != null) {
      JSON_DAT.push({ msg: req.query.msg, user: JSON_DAT2[userID].username });
    }
  }
  res.send(JSON.stringify(JSON_DAT));
});
// start the Express server
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
