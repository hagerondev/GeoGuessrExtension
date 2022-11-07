// result detect
function createRankingElement(data, userName) {
	// get this round
	let round = -1;
	for(let d of data) {
		round = Math.max(round, d[6]);
	}
	round = String(round)
	console.log("This round is",round);

	let result = document.getElementsByTagName('tbody')
	// data = [
	// 	[1, "https://www.geoguessr.com/images/auto/48/48/ce/0/plain/pin/bdb14f46902805d1053688b0644d7604.png", "hageron1", "150 m", "420 points", "2,420 points"],
	// 	[2, "https://www.geoguessr.com/images/auto/48/48/ce/0/plain/pin/bdb14f46902805d1053688b0644d7604.png", "hageron2", "150 m", "420 points", "2,420 points"],
	// 	[3, "https://www.geoguessr.com/images/auto/48/48/ce/0/plain/pin/bdb14f46902805d1053688b0644d7604.png", "hageron3", "150 m", "420 points", "2,420 points"],
	// ]

	let players = [];
	for (let d of data) {
		let addStyle = "background-color: rgba(182, 175, 255, 0.365);"
		if (d[2].toUpperCase()!==userName.toUpperCase()) addStyle = "";
		let distV = d[3];
		let roundV = d[4];
		if (d[6]!==round) {
			distV = "推測中";
			roundV = "推測中";
		}
		players.push(`
		<div style="display: flex; flex-direction: column; border-radius: 3px; ${addStyle}">
		  <div style="display: flex; flex-direction: row; margin: 10px 20px;">
		    <div style="display: flex; align-items: center; flex-basis: 10%; justify-content: flex-start;">${d[0]}.</div>
		    <div style="display: flex; align-items: center; flex-basis: 45%; justify-content: flex-start;">
		      <img style="border-radius: 50%; border: 3px solid gray; width: 35px; margin-right: 10px;"
		      src="${d[1]}" />${d[2]}
		    </div>
		    <div style="display: flex; align-items: center;  flex-basis: 15%; justify-content: flex-end;">${distV}</div>
		    <div style="display: flex; align-items: center;  flex-basis: 15%; justify-content: flex-end;">${roundV}</div>
		    <div style="display: flex; align-items: center;  flex-basis: 15%; justify-content: flex-end;">${d[5]}</div>
		  </div>
		</div>
		`)
	}
	let ranking = `
	<div style="color: white;">

	  <div>
	    <div style="display: flex; flex-direction: column;">
	      <div style="display: flex; flex-direction: row; margin: 10px 20px; font-size: 0.9em; color: rgb(183, 183, 183); font-weight: bold;">
	        <div style="display: flex; align-items: center; flex-basis: 10%; justify-content: flex-start;">順位</div>
	        <div style="display: flex; align-items: center; flex-basis: 45%; justify-content: flex-start;">プレイヤー</div>
	        <div style="display: flex; align-items: center; flex-basis: 15%; justify-content: flex-end;">距離</div>
	        <div style="display: flex; align-items: center; flex-basis: 15%; justify-content: flex-end;">ROUND</div>
	        <div style="display: flex; align-items: center; flex-basis: 15%; justify-content: flex-end;">TOTAL</div>
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
			return [0,img,name,dist,round,total,1];
		}
	}
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
				let newRanking = mergeRanking(data);
				updateRanking(newRanking);
				// console.log("nr",newRanking)
				let ele = createRankingElement(newRanking, userName);
				// console.log("ele",ele)
				// replaceRanking(ele);
				removeRanking();
				replaceRankingReload(ele);
			}else{
				console.log("ALREADY ADDED")
			}
		},500);
	}else if(isReload) {
		let ele = createRankingElement(data["ranking"], userName);
		replaceRankingReload(ele);
	}
}