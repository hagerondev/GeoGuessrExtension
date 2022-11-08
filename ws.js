class WS {
	constructor() {
		this.ws = null;
		this.connect()
	}

	connect() {
		this.ws = new WebSocket('wss://hqo6gpwt6k.execute-api.ap-northeast-1.amazonaws.com/production');
		this.ws.onopen = (event) => {
			this.ws.send(JSON.stringify({
				"state": "prepare",
				"action": "join",
				"content": {
					"userID": userName,
					"gameID": gameID,
				}
			}))
		}
		this.ws.onmessage = (event) => {
			let resData = JSON.parse(event.data);
			console.log("ws receive",resData)
			if (reloadStatus) reloadStatus(resData);
			if (reloadRanking) reloadRanking(resData);

		}
		this.ws.onclose = (event) => {
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
				this.connect()
			}, 3000);
		}
	}
}


function sendReady() {
	console.log("SEND READY")
	ws.ws.send(JSON.stringify({
		"state": "prepare",
		"action": "ready",
		"content": {
			"userID": userName,
			"gameID": gameID,
		}
	}))
}

function guess() {
	console.log("SEND GUESS")
	ws.ws.send(JSON.stringify({
		"state": "prepare",
		"action": "join",
		"content": {
			"userID": userName,
			"gameID": gameID,
		}
	}))
}

function updateRanking(data) {
	console.log("SEND RANKING")
	ws.ws.send(JSON.stringify({
		"state": "ranking",
		"action": "update",
		"content": {
			"ranking": data,
			"userID": userName,
			"gameID": gameID,
		},
	}))
}


function updateRankingMyData(data) {
	console.log("SEND RANKING MY DATA")
	ws.ws.send(JSON.stringify({
		"state": "ranking",
		"action": "updateMe",
		"content": {
			"rankingMe": data,
			"userID": userName,
			"gameID": gameID,
		},
	}))
}

const ws = new WS();