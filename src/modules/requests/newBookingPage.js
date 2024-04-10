const fetch = require("node-fetch");
const AbortController = require("abort-controller");
const { JSDOM } = require("jsdom");

const getSTicket = require("../getSTicket/fromNewBookingPage");

const new_boooking_url = "https://onlinebooking.sand.telangana.gov.in/Order/NEWBOOKING.aspx"

module.exports = function(inp) {
	return new Promise(async (resolve, reject) => {

		// const controller = new AbortController();
		// const timeoutId = setTimeout(() => controller.abort(), 300);
		try {
			resp = await fetch(`${new_boooking_url}?${inp.queryString}`, {
				// signal: controller.signal,
				headers: {
					"Host": "onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Connection": "keep-alive",
					"Cookie": `${inp.cookie}`
				},
				agent: function(url) {
					return global.httpsAgent
				}
			});

			// clearTimeout(timeoutId);

			if(resp.ok) {
				console.log("new booking page headers : ", resp.headers)
				let html = await resp.text();
				let dom = new JSDOM(html);

				let lblk = dom.window.document.querySelector("#ccMain_lblk").innerHTML.trim();
				let email = dom.window.document.querySelector("#ccMain_lblEmail").innerHTML.trim();
				let captchaImgData = dom.window.document.querySelector("#ccMain_imgCaptcha").getAttribute("src");
				
				let sTicket = getSTicket(html);
				
				resolve({
					sTicket,

					lblk,
					email,
					captchaImgData
				});
			} else {
				reject(resp);
			}
		} catch(e) {
			reject(e);
		}
	});
}