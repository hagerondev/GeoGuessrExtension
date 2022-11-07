// ready button detect
let beforeButtonBool = false;
function guessDetector() {
	let button = document.querySelectorAll('[data-qa="close-round-result"]')[0];
	
	if (button!==undefined && beforeButtonBool===false) {
		beforeButtonBool = true;
		// req
		if (button.innerText.toUpperCase()==="PLAY NEXT ROUND") {
			guess();
			// setTimeout(guess,2000)
		}
	}else if(button===undefined && beforeButtonBool===true){
		beforeButtonBool = false;
	}
}
setInterval(guessDetector, 1300)

let beforeRankingBool = false;
function rankingDetector() {
	let button = document.getElementsByTagName("tbody")[0];
	
	if (button!==undefined && beforeRankingBool===false) {
		beforeRankingBool = true;
		// req
		
	}else if(button===undefined && beforeRankingBool===true){
		beforeRankingBool = false;
	}
}
setInterval(guessDetector, 1000)