
// 広告自動削除

function adAutoRemove() {
	let ad1 = document.getElementById("adngin-geoguessr_sidebar_skyscraper-0");
	if (ad1!==undefined && ad1!==null && ad1.parentNode.style.display!=="none") {
		ad1.parentNode.style.display = "none";
		window.dispatchEvent(new Event("resize"));
	}
	let ad2 = document.getElementsByTagName("footer")[0];
	if (ad2!==undefined && ad2.style.display!=="none") {
		ad2.style.display = "none"
		window.dispatchEvent(new Event("resize"));
	}
	setTimeout(adAutoRemove, 1000);
}
adAutoRemove()