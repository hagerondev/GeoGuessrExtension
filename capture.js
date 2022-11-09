// ready button detect
let beforeButtonBool = false;
function guessDetector() {
	let memo = "start";
	let button = document.querySelectorAll('[data-qa="close-round-result"]')[0];
	
	if (button!==undefined && beforeButtonBool===false) {
		beforeButtonBool = true;
		// req
		guess();
		memo = "guess"
		setTimeout(guessDetector, 5000)
	}else if(button===undefined && beforeButtonBool===true){
		beforeButtonBool = false;
		memo = "start map"
		setTimeout(guessDetector, 1300)
	}else{
		memo = "now map"
		setTimeout(guessDetector, 1300)
	}
}
// setInterval(guessDetector, 1300)
setTimeout(guessDetector, 1300)

// let beforeRankingBool = false;
// function rankingDetector() {
// 	let button = document.getElementsByTagName("tbody")[0];
	
// 	if (button!==undefined && beforeRankingBool===false) {
// 		beforeRankingBool = true;
// 		// req
		
// 	}else if(button===undefined && beforeRankingBool===true){
// 		beforeRankingBool = false;
// 	}
// }
// setInterval(rankingDetector, 1000)

let beforeTime = 0;
function timerDetector() {
	let timeStr = document.getElementsByClassName("clock-timer_timer__Ni1Wy")[0];
	if (timeStr===undefined) {
		beforeTime = 0;
		return;
	};
	let info = timeStr.innerText.split(":");
	let remain = Number(info[0])*60+Number(info[1]);
	beforeTime = remain;
	// console.log(remain)
	return remain;
}
setInterval(timerDetector, 1000)

let lastDetectorBool = false;
function lastDetector() {
	if (lastDetectorBool) return;
	let button = document.querySelectorAll('[data-qa="close-round-result"]')[0];
	if (button===undefined) return;
	if (button.innerText.toUpperCase().includes("SUMMARY")) {
		lastDetectorBool = true;
		updateRankingMyData(readMyDataLast())
	}
}
setInterval(lastDetector, 1000);