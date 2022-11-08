let profile = JSON.parse(document.getElementById("__NEXT_DATA__").innerHTML)
let userName = profile.props.middlewareResults[0].account.user.nick

const metas = document.querySelectorAll('meta');
let gameID = "";
for(let meta of metas) {
	if (meta.getAttribute("property")==="og:url") {
		let t = meta.getAttribute("content").split("/");
		gameID = t[t.length-1];
		break;
	}
}

class WS {
	constructor() {
		this.ws = null;
		this.connect()
	}

	connect() {
		this.ws = new WebSocket('wss://hqo6gpwt6k.execute-api.ap-northeast-1.amazonaws.com/production');
		this.ws.onopen = (event) => {
			this.ws.send(JSON.stringify({
				"state": "result",
				"action": "get",
				"content": {
					"gameID": gameID,
				}
			}))
		}
		this.ws.onmessage = (event) => {
			let resData = JSON.parse(event.data);
			console.log("ws receive",resData)
			updateRanking(resData)

		}
		this.ws.onclose = (event) => {
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
				this.connect()
			}, 3000);
		}
	}
}

const ws = new WS();

// fetch("https://bqpynp7etxsmwvd2rrv2syct640aprlz.lambda-url.ap-northeast-1.on.aws/?gameID="+gameID,{
// 	mode: "cors",
// }).then(res => res.json()).then(data => {
// 	data["rankingAll"].sort((a,b) => {
// 		if (a[2]<b[2]) return 1;
// 		if (a[2]>b[2]) return -1;
// 		if (a[0]<b[0]) return 1;
// 		if (a[0]>b[0]) return -1;
// 	})
// 	updateRanking(data)
// })

function updateRanking(original) {
	console.log("ori",original)
	if (original!==undefined) {
		let data = original["rankingAll"];
		let timeMag = original["timeMag"];
		if (timeMag===undefined) timeMag = 0;

		// alter data
		let resultD = {};
		let pointSum = {};
		let timeSum = {};
		for(let d of data) {
			let name = d[2].toUpperCase();
			if (resultD[name]===undefined) {
				resultD[name] = {
					"name": name,
					"img": d[1],
					"data": [],
				};
			}
			resultD[name]["data"].push({
				"dist": d[3],
				"distPoints": d[4],
				"time": d[7],
				"timePoints": d[7]*timeMag,
			})

			let t1 = d[4];
			let t2 = d[7];
			if (pointSum[name]===undefined) pointSum[name]=0;
			if (timeSum[name]===undefined) timeSum[name]=0;
			if (!isNaN(t1)) pointSum[name]+=t1;
			if (!isNaN(t2)) timeSum[name]+=t2;
		}
		
		let result = [];
		for(let name in resultD) result.push(resultD[name]);
		result.sort((a,b) => {
			let aName = a["name"].toUpperCase();
			let bName = b["name"].toUpperCase();
			let aSum = pointSum[aName]+timeSum[aName]*timeMag;
			let bSum = pointSum[bName]+timeSum[bName]*timeMag;
			if (aSum<bSum) return 1;
			else return -1;
		})

		let players = [];
		let rnk = 1;
		for(let p of result) {
			let name = p["name"];
			let isMe = name.toUpperCase()===userName.toUpperCase();
			let addStyle = "";
			if (isMe) addStyle = "background-color: rgba(184, 202, 254, 0.3);"
			players.push(`
			<div style="display: flex; padding: 15px 5px; ${addStyle}">
				<div style="flex-basis: 5%; display: flex; align-items: center;">&nbsp;&nbsp;${rnk++}</div>
				<div style="flex-basis: 17%; display: flex; align-items: center;">
					<img style="margin-right: 7px; width:35px; border-radius: 50%; border: 2px splid gray;"
						src="${p["img"]}" />
					<div>${p["name"]}</div>
				</div>
			`);

			for(let d of p["data"]) {
				let timeDiv = `<div style="font-weight: bold;">${d["timePoints"].toLocaleString()} pts</div>`;
				let dist = d["dist"];
				if (dist===null) dist = "時間切れ";
				if (d["timePoints"]===0) timeDiv = "";
				players.push(`<div style="flex-basis: 13%; display: flex; flex-direction: column;;">
					<div style="font-weight: bold;">${d["distPoints"].toLocaleString()} pts</div>
					<div style="font-size: 0.9em;">${dist}</div>
					<div style="width: 50%; border-bottom: 1px solid rgb(199, 199, 199);"></div>
					${timeDiv}
					<div style="font-size: 0.9em;">${d["time"]} s</div>
				</div>`)
			}

			// not yet finished
			let blankCnt = 5-p["data"].length;
			for(var i=0;i<blankCnt;i++) {
				players.push(`<div style="flex-basis: 13%; display: flex; flex-direction: column; justify-content: center;">
				<div style="font-weight: bold;">推測中</div></div>`);
			}

			let totalResult = pointSum[name]+timeSum[name]*timeMag;
			players.push(`<div style="flex-basis: 13%; display: flex; flex-direction: column; justify-content: center;">
				<div style="font-weight: bold;">${totalResult.toLocaleString()} pts</div></div></div>`);
		}


		let ranking = `
		<div style="font-size: 0.9em; color: rgb(207, 207, 207); padding: 10px 5px; font-weight: bold;">
			<div style="display: flex;">
				<div style="flex-basis: 5%;">順位</div>
				<div style="flex-basis: 17%;">プレイヤー</div>
				<div style="flex-basis: 13%;">Round 1</div>
				<div style="flex-basis: 13%;">Round 2</div>
				<div style="flex-basis: 13%;">Round 3</div>
				<div style="flex-basis: 13%;">Round 4</div>
				<div style="flex-basis: 13%;">Round 5</div>
				<div style="flex-basis: 13%;">Total</div>
			</div>
		</div>
		<div style="line-height: 1.5em;">${players.join("")}</div>
		`.replace("/\n/g","").replace("/\t/g","");

		let divs = document.getElementsByTagName("div");
		for(let div of divs) {
			if (div.className.startsWith("results_table_")) {
				div.innerHTML = ranking;
				console.log("REPLACE")
				return;
			}
		}
	}
	console.log("RETRY")
	setTimeout(() => updateRanking(original), 300)
}