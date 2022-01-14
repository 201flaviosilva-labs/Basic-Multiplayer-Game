const WebSocket = require("ws");
const Game = require("./game");

const ServerGame = new Game();

setInterval(update, 1000 / 60);

function onConnection(ws, req) {
	ws.on("message", data => onMessage(ws, data));
	ws.on("error", error => onError(ws, error));
	ws.on("close", () => onClose(ws));
	// console.log("onConnection");
}

function onMessage(ws, data) {
	const message = JSON.parse(data);
	switch (message.type) {
		case "NewPlayer":
			onNewPlayer(ws, message);
			break;
		case "Move":
			onMove(ws, message);
			break;
		default:
			console.log("Unknown message type: ", message.type);
	}
}

function onNewPlayer(ws, message) {
	ws.id = message.userId;
	ServerGame.addPlayer(message.userId, ws);
}

function onMove(ws, message) {
	ServerGame.updatePlayerDirections(message.userId, message.directions);
}

function update() {
	ServerGame.update();
	const data = {
		type: "Update",
		state: ServerGame.getState(),
	}
	sendToAll(JSON.stringify(data));
}

function sendToAll(jsonObject) {
	ServerGame.players.forEach(player => {
		player.ws.send(jsonObject);
	});
}

function onError(ws, err) { console.error(`onError: ${err.message}`); }
function onClose(ws) { ServerGame.removePlayer(ws.id); }
function broadcast(jsonObject) {
	if (!this.clients) return;
	this.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(jsonObject));
		}
	});
}

module.exports = (server) => {
	const wss = new WebSocket.Server({ server });
	wss.on("connection", onConnection);
	wss.broadcast = broadcast;
	return wss;
}
