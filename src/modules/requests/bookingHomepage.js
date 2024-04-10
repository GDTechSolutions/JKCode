const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const AbortController = require("abort-controller");

const booking_home_url = "https://onlinebooking.sand.telangana.gov.in/Order/BOOKINGHOME.aspx";

module.exports = function(inp) {
	return new Promise(async (resolve, reject) => {
		// const controller = new AbortController();
		// const timeoutId = setTimeout(() => controller.abort(), 500);
		try {
			resp = await fetch(booking_home_url, {
				method: "GET",
				// signal: controller.signal,
				headers: {
					"Host": "onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Accept": "application/json, text/javascript, */*; q=0.01",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"Content-Type": "application/json; charset=utf-8",
					"X-Requested-With": "XMLHttpRequest",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Connection": "keep-alive",
					"Sec-Fetch-Dest": "empty",
					"Sec-Fetch-Mode": "cors",
					"Sec-Fetch-Site": "same-origin",
					"Cookie": `${inp.cookie}`
				},
				agent: function(url) {
					return global.httpsAgent
				}
			});

			// clearTimeout(timeoutId);

			if(resp.ok) {
				console.log("booking homepage headers : ", resp.headers);

				let eventTarget, eventArgument;
				let viewState, viewStateGenerator, viewStateEncrpyted, eventValidation;
		
				html = await resp.text();
					
				// console.log(html);
				// javascript:__doPostBack(&#39;ctl00$ryZtVq&#39;,&#39;&#39;)"
		
				let dom = new JSDOM(html);
				let document = dom.window.document;
		
				let el = document.querySelector("#liCustomerOrders > a");
				let href = el.getAttribute("href");
				let args = href.replace("javascript:__doPostBack(","");
				args = args.replace(")","");
				args = args.split(",");
		
				let arg1 = new String(args[0]);
				let arg2 = new String(args[1]);
		
				arg1 = arg1.replace("'","").replace("'","");
				arg2 = arg2.replace("'","").replace("'","");
		
				eventTarget = arg1;
				eventArgument = arg2;
		
				viewState = document.querySelector("input[type='hidden'][name='__VIEWSTATE']").value;
				viewStateGenerator = document.querySelector("input[type='hidden'][name='__VIEWSTATEGENERATOR']").value;
				viewStateEncrpyted = document.querySelector("input[type='hidden'][name='__VIEWSTATEENCRYPTED']").value;
				eventValidation = document.querySelector("input[type='hidden'][name='__EVENTVALIDATION']").value;

				resolve({
					eventTarget,
					eventArgument,

					viewState,
					viewStateGenerator,
					viewStateEncrpyted,
					eventValidation
				});
			}
		} catch(e) {
			reject(e);
		}
	})
}