const express = require("express");
const path = require("path");

const app = require("./server/app");
const appWs = require("./server/app-ws");

app.use(express.static(path.join(__dirname, "/public")));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => { console.log("Run in: ", port); });

const wss = appWs(server);
