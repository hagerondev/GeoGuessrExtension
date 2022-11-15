let profile = JSON.parse(document.getElementById("__NEXT_DATA__").innerHTML)
let userName = profile.props.middlewareResults[0].account.user.nick
const gameID = window.location.href.split("/")[window.location.href.split("/").length-1];


// prepare
if (document.body.innerText.includes("You have been challenged!")) {
	let entry = `
	<div id="ggeStatusCover" style="display:flex;justify-content:center;flex-direction:column;font-size: 1.3em;line-height: 2em;margin: 20px auto;text-align: center;width: 80%">
		<h3 style="margin-top: 10px;">全員が「Ready!」を押すと自動でゲームをスタートします</h3>
		<div style="display: flex;justify-content: center;padding: 10px;">
			<div>残り時間を得点に追加：</div>
			<select id="ID-timeMag" name="timeMag" style="color:white;width: 30%;background-color: rgba(0,0,0,0);border: 1px solid white;padding: 11px;">
				<option value="0" style="color:black">設定無し</option>
				<option value="1" style="color:black">1倍</option>
				<option value="2" style="color:black">2倍</option>
				<option value="3" style="color:black">3倍</option>
				<option value="4" style="color:black">4倍</option>
				<option value="5" style="color:black">5倍</option>
				<option value="6" style="color:black">6倍</option>
				<option value="7" style="color:black">7倍</option>
				<option value="8" style="color:black">8倍</option>
				<option value="9" style="color:black">9倍</option>
				<option value="10" style="color:black">10倍</option>
			</select>
		</div>
		<div style="margin: 3px 0;">参加者</div>
		<div id="ggeStatus"></div>
	</div>
	`
	// get start game class
	let start_button = document.querySelectorAll('[data-qa="join-challenge-button"]')[0];
	// insert ready button
	let ready_button = '<button id="readyButton" type="button" class="'+start_button.className+'" style="margin-left: 15px;background-color: orange;">Ready!</button>';
	start_button.insertAdjacentHTML("afterend",entry)
	start_button.insertAdjacentHTML("afterend",ready_button)
	// start_button.style.display = "none";
	document.getElementById("readyButton").addEventListener("click", removeReady);
	// send mag
	const select = document.getElementById("ID-timeMag");
	select.addEventListener("change", () => {
		updateTimeMag(select.value);
	})
}
// document.body.innerText.includes("PLAY NEXT ROUND")

function roundPrepare() {
	// 全員の「READY!」を待っています 参加者
	let visible = false;
	let entry = `
	<div id="ggeStatusCover" style="display:flex;justify-content:center;flex-direction:column;font-size: 1.2em;line-height: 2em;margin: 20px auto;text-align: center;">
		<h3 style=""></h3>
		<div style="margin: 3px 0;"></div>
		<div id="ggeStatus"></div>
	</div>
	`
	if (!visible) entry = '<div style="display:none">'+entry+'</div>'
	let start_button = document.querySelectorAll('[data-qa="close-round-result"]')[0];
	let ready_button = '<button id="readyButton" type="button" class="'+start_button.className+'" style="margin-left: 15px;background-color: orange;">Ready!</button>';
	start_button.insertAdjacentHTML("afterend",entry)
	start_button.insertAdjacentHTML("afterend",ready_button)
	document.getElementById("readyButton").addEventListener("click", removeReady);
	let next_button = document.querySelectorAll('[data-qa="close-round-result"]')[0];
	if (next_button!==undefined) {
		// next_button.style.display = "none";	
	}
}

function removeReady() {
	let button = document.getElementById("readyButton");
	button.remove()
	sendReady()
}

function startGame(remain=3) {
	if (remain==3) {
		// insert countdown
		let ele = '<div id="gge-cnt" style="font-family: Impact,Charcoal;position: absolute;width: 100%;height: 100%;background-color: rgba(0,0,0,.8);top: 0;left: 0;text-align: center;font-size: 14em;padding-top: 1em;z-index:100; color:white;">3</div>'
		document.body.insertAdjacentHTML("afterend",ele);
		setTimeout(startGame.bind(undefined, remain-1),1000);
	}else if(remain>0) {
		let ele = document.getElementById("gge-cnt");
		ele.innerHTML = remain;
		setTimeout(startGame.bind(undefined, remain-1),1000);
	}else{
		// remain is 0
		let ele = document.getElementById("gge-cnt");
		ele.innerHTML = "START!";
		setTimeout(function() {
			if (document.querySelectorAll('[data-qa="join-challenge-button"]')[0]){
				document.querySelectorAll('[data-qa="join-challenge-button"]')[0].click();	
			}else if(document.querySelectorAll('[data-qa="close-round-result"]')[0]) {
				document.querySelectorAll('[data-qa="close-round-result"]')[0].click();
			}
			
			ele.remove()

		},500);
		
	}

}

function reloadStatus(data) {
	let isPrepare = document.body.innerText.includes("You have been challenged!");
	let isRound = document.querySelectorAll('[data-qa="close-round-result"]')[0]!==undefined;
	if (!isPrepare && !isRound) return;
	if (document.getElementById("ggeStatus")===null) roundPrepare();
	if (data["ready"]===undefined) data["ready"] = [];
	let eles = []
	for (let player of data["players"]) {
		eles.push('<div style="display:flex;justify-content:center;flex-direction:row;border-bottom: 1px solid;">')
		eles.push('<div style="flex-basis: 50%;">'+player+'</div>')
		if (data["ready"].includes(player)) {
			eles.push('<div style="flex-basis: 50%;">🔵Ready!</div></div>')
		}else{
			eles.push('<div style="flex-basis: 50%;">🔴Not ready...</div></div>')
		}
	}
	eles.push('</div>')
	document.getElementById("ggeStatus").innerHTML = eles.join("")
	if (data["gge"]===1) {
		let waitfor = data["startTime"]-(new Date()).getTime()/1000;
		// document.getElementById("readyTitle").innerHTML = "ゲームを開始します。少々お待ち下さい。"
		// console.log("wait",waitfor)
		startGame()
	}
}

function reloadSettings(data) {
	let select = document.getElementById("ID-timeMag");
	if (select!==null) {
		let mag = data["timeMag"];
		if (mag===undefined) mag = 0;
		select.options[Number(mag)].selected = true;
	}
}
