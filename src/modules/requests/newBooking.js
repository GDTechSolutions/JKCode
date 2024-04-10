const fetch = require("node-fetch");
const AbortController = require("abort-controller");
const { JSDOM } = require("jsdom");

const booking_home_url = "https://onlinebooking.sand.telangana.gov.in/Order/BOOKINGHOME.aspx";

module.exports = function(inp) {
	return new Promise(async (resolve, reject) => {

		// const controller = new AbortController();
		// const timeoutId = setTimeout(() => controller.abort(), 300);
		try {
			resp = await fetch(booking_home_url, {
				method: "POST",
				// signal: controller.signal,
				headers: {
					"Host": "onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"Content-Type": "application/x-www-form-urlencoded",
					"X-Requested-With": "XMLHttpRequest",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Connection": "keep-alive",
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": "Windows",
					"Sec-Fetch-Dest": "document",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Cookie": `${inp.cookie}`
				},
				body: new URLSearchParams({
					"__EVENTTARGET": inp.eventTarget,
					"__EVENTARGUMENT": inp.eventArgument,
					"__VIEWSTATE": inp.viewState,
					"__VIEWSTATEGENERATOR": inp.viewStateGenerator,
					"__VIEWSTATEENCRYPTED": inp.viewStateEncrpyted,
					"__EVENTVALIDATION": inp.eventValidation
				}).toString(),
				agent: function(url) {
					return global.httpsAgent
				}
			});

			// clearTimeout(timeoutId);

			if(resp.ok) {
				let html = await resp.text();
				let dom = new JSDOM(html);
				let script = dom.window.document.querySelector("script");
	
				let innerHTML = script.innerHTML;
				innerHTML = innerHTML.split("?")[1];
				
				let queryString = innerHTML.split("'")[0];
				resolve(queryString);
			}
		} catch(e) {
			reject(e);
		}
	});
}