// const AbortController = require("abort-controller");
// const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
// const { performance } = require('perf_hooks');

// const homepageRequest = require("./homepage.v2");
const goHomepage = require("../goHomepage/index");
// const fetchCaptcha = require("../fetchCaptchaImage");
const getSticket = require("../getSTicket/fromHomepage");

// const home_url = "https://onlinebooking.sand.telangana.gov.in/Masters/Home.aspx";

function getHomepage(slot) {
	return new Promise((resolve, reject) => {

		// const controller = new AbortController();
		// const timeoutId = setTimeout(() => controller.abort(), timeout);

		let uni, pswi;
		let sTicket;
		let scptr, scptv;
		let iv;
		let cookie;
		let imgData;

		let timerStartTimestamp;

		// fetch(home_url, {
		// 	headers: {
		// 		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0"
		// 	},
		// 	signal: controller.signal
		// })
		// .then(_resp => {
		// 	resp = _resp;

		// 	clearTimeout(timeoutId);
		// 	t1 = performance.now();

		// 	if(resp.ok) {
		// 		if(resp.redirected) {
		// 			reject("redirected");
		// 			return;
		// 		}
	
		// 		return resp.text();
		// 	} else {
		// 		reject();
		// 		return;
		// 	}
		// })

		goHomepage(slot)
		.then(async resp => {
			let html = resp.html;
			timerStartTimestamp = resp.timerStartTimestamp;
			imgData = resp.imgData;
			cookie = resp.cookie;

			let dom = new JSDOM(html);

			let userNameEl = dom.window.document.querySelector("#tblLogIn #divd > input[type=text][style='border: 1px solid #a0004f; padding: 3px 10px; Width:140px']");
			let passwordEl = dom.window.document.querySelector("#tblLogIn input[type=password]");
	
			iv = passwordEl.getAttribute("onblur").split("('")[1].split("')")[0].trim();
	
			uni = userNameEl.getAttribute("id");
			pswi = passwordEl.getAttribute("id");
	
			scptr = dom.window.document.querySelector("#lblpt").value;
			scptv = scptr;
	
			let scripts = dom.window.document.querySelectorAll("script");
			let scriptSource;
			for(let i=0; i<scripts.length; i++) {
				if(scripts[i].innerHTML.includes(`_0xeb4d`)) {
					scriptSource = scripts[i].innerHTML;
					break;
				}
			}
			sTicket = await getSticket(scriptSource);

			resolve({
				uni,
				pswi,
				iv,

				cookie: `ASP.NET_SessionId=${cookie}`,

				imgData,

				sTicket,
				scptv,
				scptr,
				
				timerStartTimestamp
			});
		})
		.catch(reject);
	});
}

// let sessions = [];

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function obtainSession(slot) {
	return new Promise(async (resolve) => {
		while(true) {
			try {
				let resp = await getHomepage(slot);
				resolve(resp);
				break;
			} catch(e) {
				console.log(e);
				await wait(100);
			}
		}
	});
}

module.exports = obtainSession;