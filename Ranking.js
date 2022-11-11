// result detect
function createRankingElement(original, userName) {
	// ready
	let isReady = new Set();
	if (original["ready"]===undefined) original["ready"]=[];
	for (let p of original["ready"]) isReady.add(p.toUpperCase());

	// get this round
	let dataAll = original["rankingAll"]
	let round = -1;
	for(let d of dataAll) {
		if (d[2].toUpperCase()===userName.toUpperCase()) round=d[6];
	}
	console.log("ver 2 This round is",round);
	let timeMag = Number(original["timeMag"]);
	if (isNaN(timeMag)) timeMag=0;

	// total calc
	let timeTotal = {};
	let pointTotal = {};
	for(let d of dataAll) {
		let name = d[2].toUpperCase();
		if (timeTotal[name]===undefined) timeTotal[name] = 0;
		if (pointTotal[name]===undefined) pointTotal[name] = 0;
		let t = Number(d[7]);
		if (!isNaN(t)) timeTotal[name] += t;
		t = Number(d[4]);
		if (!isNaN(t)) pointTotal[name] += t;
	}

	// prepare only need data
	let data = [];
	let used = new Set();
	dataAll.sort((a,b) => {
		if (a[2]<b[2]) return 1;
		if (a[2]>b[2]) return -1;
		if (a[0]<b[0]) return 1;
		if (a[0]>b[0]) return -1;
		// if (a[5]<b[5]) return 1;
		// if (a[5]>b[5]) return -1;
		// if (a[4]>b[4]) return 1;
		// if (a[4]<b[4]) return -1;
		return 1;
	})
	console.log(dataAll)
	for(let d of dataAll) {
		let name = d[2].toUpperCase();
		if (!used.has(name)) {
			used.add(name);
			data.push(d);
		}
	}

	data.sort((a,b) => {
		let aName = a[2].toUpperCase();
		let bName = b[2].toUpperCase();
		let aTotal = timeTotal[aName]*timeMag+pointTotal[aName];
		let bTotal = timeTotal[bName]*timeMag+pointTotal[bName];
		if (aTotal<bTotal) return 1;
		else return -1;
	})

	let players = [];
	let rnk = 1;
	for (let d of data) {
		let addStyle = "background-color: rgba(182, 175, 255, 0.365);"
		if (d[2].toUpperCase()!==userName.toUpperCase()) addStyle = "";
		let distV = d[3];
		let distPoint = d[4];
		let remain = d[7];
		let readyState = "🔴";
		if (isReady.has(d[2].toUpperCase())) readyState="🔵";
		let timePoint = timeMag*remain;
		let timeDiv = `${timePoint.toLocaleString()}<div style="font-size: 0.8em;">残り ${remain} s</div>`
		if (timeMag===0) timeDiv = `残り ${remain} s`;
		let roundSum = distPoint+timePoint;
		let totalSum = pointTotal[d[2].toUpperCase()] + timeTotal[d[2].toUpperCase()]*timeMag;
		if (distV===null) distV = "時間切れ";
		if (d[6]!==round) {
			distV = "";
			distPoint = `ラウンド${d[6]+1}`;
			roundSum = `を推測中`;
			timeDiv = "";
			// totalSum = "推測中";
		}
		players.push(`
		<div style="display: flex; flex-direction: column; border-radius: 3px; ${addStyle}" data-gge-round="${d[6]}">
		  <div style="display: flex; flex-direction: row; margin: 10px 20px;">
		    <div style="display: flex; align-items: center; flex-basis: 7%; justify-content: flex-start;">&nbsp;&nbsp;${rnk++}</div>
		    <div style="display: flex; align-items: center; flex-basis: 37%; justify-content: flex-start;">
		      <img style="border-radius: 50%; border: 3px solid gray; width: 35px; margin-right: 10px;"
		      src="${d[1]}" />${d[2]}&nbsp;&nbsp;${readyState}
		    </div>
		    <div style="display: flex; align-items: center;  flex-basis: 14%; justify-content: flex-end;"><div style="text-align: right;">${timeDiv}</div></div>
		    <div style="display: flex; align-items: center;  flex-basis: 14%; justify-content: flex-end;"><div style="text-align: right;">${distPoint.toLocaleString()}<div style="font-size: 0.8em;">${distV}</div></div></div>
		    <div style="display: flex; align-items: center;  flex-basis: 14%; justify-content: flex-end;">${roundSum.toLocaleString()}</div>
		    <div style="display: flex; align-items: center;  flex-basis: 14%; justify-content: flex-end;">${totalSum.toLocaleString()}</div>
		  </div>
		</div>
		`)
	}
	let ranking = `
	<div style="color: white;">

	  <div>
	    <div style="display: flex; flex-direction: column;">
	      <div style="display: flex; flex-direction: row; margin: 10px 20px; font-size: 0.9em; color: rgb(183, 183, 183); font-weight: bold;">
	        <div style="display: flex; align-items: center; flex-basis: 7%; justify-content: flex-start;">順位</div>
	        <div style="display: flex; align-items: center; flex-basis: 37%; justify-content: flex-start;">プレイヤー</div>
	        <!--div style="display: flex; align-items: center; flex-basis: 15%; justify-content: flex-end;">距離</div-->
	        <div style="display: flex; align-items: center; flex-basis: 14%; justify-content: flex-end;">TIME</div>
	        <div style="display: flex; align-items: center; flex-basis: 14%; justify-content: flex-end;">DISTANCE</div>
	        <div style="display: flex; align-items: center; flex-basis: 14%; justify-content: flex-end;">ROUND</div>
	        <div style="display: flex; align-items: center; flex-basis: 14%; justify-content: flex-end;">TOTAL</div>
	      </div>
	      <div style="width: 100%; border-bottom: 1px solid gray;"></div>
	    </div>
	  </div>

	  <div>
	  ${players.join("")}
	  </div>
	</div>
	`

	return ranking.replace(/[\t\n]/g,"")
}

function readMyData() {
	return readMyDataLast()
	// distance
	let dist;
	let desc = document.querySelectorAll('[data-qa="guess-description"]')[0].getElementsByTagName("div");
	for (let div of desc) {
		if (div.className.includes("guess-description-distance_distanceValue")) {
			dist = div.innerText;
			break;
		}
	}

	let tbody = document.getElementsByTagName("tbody")[0];
	let trs = tbody.getElementsByTagName("tr");
	for(let tr of trs) {
		if (tr.className.includes("table_highlightedRow")) {
			let tds = tr.getElementsByTagName("td");
			let img = tds[1].getElementsByTagName("img")[0].src;
			let name = tds[1].innerText.slice(0,-1);
			let round = Number(tds[2].innerText.split(" ")[0].replace(/,/g,""));
			let total = Number(tds[3].innerText.split(" ")[0].replace(/,/g,""));
			// rank, picture, username, distance, round points, total points, round, remain time
			return [0,img,name,dist,round,total,1, beforeTime];
		}
	}
}

function readMyDataLast() {
	// img
	let tags = document.getElementsByTagName("img");
	let img;
	for(let tag of tags) {
		if(tag.src.includes("pin")) {
			img = tag.src;
			break;
		}
	}

	// name
	let profile = JSON.parse(document.getElementById("__NEXT_DATA__").innerHTML)
	let name = profile.props.middlewareResults[0].account.user.nick

	// distance
	let dist;
	let desc = document.querySelectorAll('[data-qa="guess-description"]')[0].getElementsByTagName("div");
	for (let div of desc) {
		if (div.className.includes("guess-description-distance_distanceValue")) {
			dist = div.innerText;
			break;
		}
	}

	// round points
	let divs = document.querySelectorAll('[data-qa="result-view-bottom"]')[0].getElementsByTagName("div");
	let roundPoints = 0;
	for(let div of divs) {
		if (div.className.startsWith("round-result_score_")) {
			roundPoints = Number(div.innerText.split(" ")[0].replace(/,/g,""))
			break;
		}
	}

	// not set
	let round = -1;
	totalPoints = -1
	// rank, picture, username, distance, round points, total points, round, remain time
	return [0, img, name, dist, roundPoints, totalPoints, round, beforeTime]
}

function mergeRanking(data) {
	let ranking = data["ranking"];
	if (ranking===undefined) ranking = [];
	let isFirstPush = true;
	let myData = readMyData();
	for(let d of ranking) {
		if (d[2]===myData[2]) {
			isFirstPush = false;
			for(var i=0;i<6;i++) {
				d[i] = myData[i];
			}
			d[6] = d[6]+1;
			break;
		}
	}
	if (isFirstPush) ranking.push(readMyData());
	ranking.sort((a,b) => {
		if (a[5]>b[5]) return -1;
		else return 1;
	})
	for(var i=1;i<=ranking.length;i++) {
		ranking[i-1][0] = i;
	}
	return ranking
}

function alreadyAdded(data) {
	let myData = readMyData();
	let ranking = data["ranking"];
	if (ranking===undefined) ranking = [];
	for(let d of ranking) {
		console.log("check",myData,d)
		let same = true;
		for(var i=1;i<d.length;i++) {
			if (myData[i]!==d[i]) {
				same = false;
				break
			}
		}
		if (same) return true;
	}
	return false;
}

// not use
function replaceRanking(ele) {
	console.log("Replace Ranking Normal")
	var divs = document.querySelectorAll('[data-qa="result-view-bottom"]')[0].getElementsByTagName("div");
	let cnt = 0;
	for(let div of divs) {
		if (div.className.includes("container_content")) {
			cnt++;
			if (cnt===1) continue;
			div.innerHTML = ele;
			break;
		}
	}
}

function removeRanking() {
	var divs = document.querySelectorAll('[data-qa="result-view-bottom"]')[0].getElementsByTagName("div");
	let cnt = 0;
	for(let div of divs) {
		if (div.className.includes("container_content")) {
			cnt++;
			if (cnt===1) continue;
			div.innerHTML = "";
			break;
		}
	}
}

function replaceRankingReload(ele) {
	console.log("Replace Ranking Reload")
	let ranking = document.getElementById("ggeRanking");
	if (ranking===null) {
		var divs = document.querySelectorAll('[data-qa="result-view-bottom"]')[0].getElementsByTagName("div");
		for (let div of divs) {
			if (div.className.includes("container_content")) {
				div.insertAdjacentHTML("beforeend", '<div id="ggeRanking">'+ele+'</div>');
				break;
			}
		}
	}else{
		ranking.innerHTML = ele;
	}
}

function reloadRanking(data) {
	let tbody = document.getElementsByTagName("tbody")[0];
	let isReload = document.querySelectorAll('[data-qa="result-view-bottom"]')[0]!==undefined;
	if (tbody!==undefined) {
		setTimeout(function() {
			if (!alreadyAdded(data)) {
				// let newRanking = mergeRanking(data);
				// updateRanking(newRanking);
				updateRankingMyData(readMyData())
				removeRanking();
			}else{
				console.log("ALREADY ADDED")
				let ele = createRankingElement(data, userName);
				replaceRankingReload(ele);
			}
		},500);
	}else if(isReload) {
		let ele = createRankingElement(data, userName);
		replaceRankingReload(ele);
	}
}