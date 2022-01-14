class Game {
	constructor() {
		this.canvas = document.createElement("canvas");
		document.body.appendChild(this.canvas);
		this.canvas.width = 800;
		this.canvas.height = 600;
		this.ctx = this.canvas.getContext("2d");

		this.userId = Math.random();

		this.ws = new WebSocket(`ws://${window.location.host}`);
		this.ws.addEventListener("open", this.onOpen.bind(this));
		this.ws.addEventListener("message", this.onMessage.bind(this));
		this.ws.addEventListener("close", this.onClose.bind(this));
		this.ws.addEventListener("error", this.onError.bind(this));

		this.directions = {
			up: false,
			down: false,
			left: false,
			right: false,
		};

		window.addEventListener("keydown", event => this.onKeyDown(event));
		window.addEventListener("keyup", event => this.onKeyUp(event));
	}

	onOpen() {
		console.log("WebSocket is open");
		this.wsSend({
			type: "NewPlayer",
			userId: this.userId,
		});
	}

	onMessage(event) {
		const message = JSON.parse(event.data);
		switch (message.type) {
			case "Update":
				this.onUpdate(message);
				break;
			default:
				console.log("Unknown message type: ", message.type);
		}
	}

	onClose() {
		console.log("WebSocket is closed");
	}

	onError(event) {
		console.error("WebSocket error: ", event);
	}

	wsSend(data) {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(data));
		}
	}

	drawRectangle(x, y, width, height, color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, width, height);
	}

	drawText(text, x, y, color, size) {
		this.ctx.fillStyle = color;
		this.ctx.font = `${size}px Arial`;
		this.ctx.textAlign = "center";
		this.ctx.fillText(text, x, y);
	}

	updateDirections() {
		this.wsSend({
			type: "Move",
			userId: this.userId,
			directions: this.directions,
		});
	}

	onKeyDown(event) {
		switch (event.keyCode) {
			case 38:
			case 87:
				this.directions.up = true;
				this.updateDirections();
				break;
			case 40:
			case 83:
				this.directions.down = true;
				this.updateDirections();
				break;
			case 37:
			case 65:
				this.directions.left = true;
				this.updateDirections();
				break;
			case 39:
			case 68:
				this.directions.right = true;
				this.updateDirections();
				break;
		}
	}

	onKeyUp(event) {
		switch (event.keyCode) {
			case 38:
			case 87:
				this.directions.up = false;
				this.updateDirections();
				break;
			case 40:
			case 83:
				this.directions.down = false;
				this.updateDirections();
				break;
			case 37:
			case 65:
				this.directions.left = false;
				this.updateDirections();
				break;
			case 39:
			case 68:
				this.directions.right = false;
				this.updateDirections();
				break;
		}
	}

	onUpdate(message) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (!message) return;
		message?.state?.players?.forEach(player => {
			this.drawRectangle(
				player.x,
				player.y,
				player.width,
				player.height,
				player.color
			);

			this.drawText(
				player.width.toFixed(1),
				player.x,
				player.y,
				player.color,
				player.width
			);
		});
	}
}

new Game();
