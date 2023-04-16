// import(s) required
const express = require("express");
const fs = require("fs");
const app = express();
const ws = require("ws");
const server = new ws.Server({ port: 5049 });
const port = 5050;
function HostDir(directory, setHTML, HTMLaltPath) {
  fs.readdirSync(__dirname + directory).forEach((e, i) => {
    if (e != "index.html") {
      app.get(`${directory}${e}`, (req, res) => {
        res.sendfile(__dirname + `${directory}${e}`);
      });
      console.log("hosting " + directory + e);
    } else {
      if (setHTML === true) {
        if (HTMLaltPath != undefined && HTMLaltPath != null) {
          app.get(`${HTMLaltPath}`, (req, res) => {
            res.sendfile(__dirname + `${directory}${e}`);
          });
          console.log("hosting " + directory + e + " on " + HTMLaltPath);
        } else {
          app.get(`/`, (req, res) => {
            res.sendfile(__dirname + `${directory}${e}`);
          });
          console.log("hosting " + directory + e);
        }
      }
    }
  });
}
const template = {
  username: "",
  pos: { x: 0, y: 0 },
};
let players = [];
server.on("connection", function connection(ws) {
  const p_id = players.length - 1;

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    const data = JSON.parse(message);
    if(data != "user"){
    players[p_id] = template;
    players[p_id].username = data.username;
    players[p_id].pos = data.pos;
    }

    ws.send(JSON.stringify({id:p_id}));
  });
  server.on("close", function close() {
    console.log(`${players[p_id].username} disconnected`);
    players.splice(p_id, 1);
  });
});

HostDir("/web-ui/home/", true, "/");
HostDir("/web-ui/game/", true, "/game");
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
