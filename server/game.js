function randomColor() { return "#" + (Math.random() * 0xFFFFFF << 0).toString(16); }
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

const Stage = {
	width: 800,
	height: 600,
};

class Player {
	constructor(userId, ws, x = 10, y = 10,) {
		this.userId = userId;
		this.ws = ws;
		this.x = x;
		this.y = y;
		this.size = 10;
		this.setSize(this.size);
		this.color = randomColor();

		this.speed = 1;

		this.directions = {
			up: false,
			down: false,
			left: false,
			right: false,
		};
	}

	setSize(width, height = width) {
		this.size = width;
		this.width = width;
		this.height = height;
	}
	setX(x) { this.setPosition(x, this.y); }
	setY(y) { this.setPosition(this.x, y); }

	updateSize(newSize) {
		if (this.size + newSize < 50) {
			this.setSize(this.size + newSize);
		}
	}

	removeSize(newSize) {
		if (this.size - newSize > 5) {
			this.setSize(this.size - newSize);
		}
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;

		this.x = Math.min(Math.max(0, this.x), Stage.width - this.width);
		this.y = Math.min(Math.max(0, this.y), Stage.height - this.height);
	}

	setRandomPosition() { this.setPosition(Math.random() * Stage.width, Math.random() * Stage.height); }

	setDirections(directions) { this.directions = directions; }

	move(direction) {
		switch (direction) {
			case "up":
				this.setY(this.y - this.speed);
				break;
			case "down":
				this.setY(this.y + this.speed);
				break;
			case "left":
				this.setX(this.x - this.speed);
				break;
			case "right":
				this.setX(this.x + this.speed);
				break;
		}
	}

	update() {
		Object.keys(this.directions).forEach(directionKey => {
			if (this.directions[directionKey]) {
				this.move(directionKey);
			}
		});

		const newSize = Math.random();
		if (newSize < 0.15) {
			this.updateSize(newSize);
		}

		this.speed = map(this.size, 5, 50, 2.5, 0.5);
	}
}

class Game {
	constructor() {
		this.players = [];

		setTimeout(() => this.update(), 1000 / 60);
	}

	addPlayer(userId, ws) {
		this.players.push(new Player(userId, ws));
	}

	removePlayer(userId) {
		this.players = this.players.filter(player => player.userId !== userId);
	}

	getPlayer(userId) {
		return this.players.find(player => player.userId === userId);
	}

	updatePlayerDirections(userId, directions) {
		const player = this.getPlayer(userId);
		if (!player) return;
		player.setDirections(directions);
	}

	getState() {
		const players = this.players.map(player => ({
			userId: player.userId,
			x: player.x,
			y: player.y,
			width: player.width,
			height: player.height,
			color: player.color,
		}));

		return {
			players,
		}
	}

	checkCollision(player1, player2) {
		return player1.x < player2.x + player2.width &&
			player1.x + player1.width > player2.x &&
			player1.y < player2.y + player2.height &&
			player1.height + player1.y > player2.y;
	}

	update() {
		this.players.forEach(player => player.update());

		// Check Collision
		for (let i = 0; i < this.players.length; i++) {
			for (let j = i + 1; j < this.players.length; j++) {
				if (this.checkCollision(this.players[i], this.players[j])) {
					if (this.players[i].size > this.players[j].size) {
						this.players[i].updateSize(this.players[j].size / 2);
						this.players[j].setRandomPosition();
						this.players[j].removeSize(this.players[j].size / 2);
						this.players[j].color = randomColor();
					}
					else {
						this.players[j].updateSize(this.players[i].size / 2);
						this.players[i].setRandomPosition();
						this.players[i].removeSize(this.players[i].size / 2);
						this.players[i].color = randomColor();
					}
				}
			}
		}
	}
}

module.exports = Game;
