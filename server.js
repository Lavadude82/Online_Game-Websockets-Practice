// import(s) required
const express = require("express");
const fs = require("fs")
const app = express();
const port = 5050;
function HostDir(directory,setHTML, HTMLaltPath) {
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
                }else{
                  app.get(`/`, (req, res) => {
                            res.sendfile(__dirname + `${directory}${e}`);
                          });
                          console.log("hosting " + directory + e);
                }
              }
            }
          });
        }
        
HostDir("/web-ui/home/",true,"/")
HostDir("/web-ui/game/",true,"/game")
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
