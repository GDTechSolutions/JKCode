const fetch = require("node-fetch");
const AbortController = require("abort-controller");

module.exports = function(inp){
	return new Promise(async (resolve, reject) => {
		// const controller = new AbortController();
		// const timeoutId = setTimeout(() => controller.abort(), 300);
		try {
			resp = await fetch("https://onlinebooking.sand.telangana.gov.in/MASTERS/HOME.aspx/CALLREGLOGIN", {
				method: "POST",
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
					"STicket": `${inp.sTicket}`,
					"Cookie": `${inp.cookie}`
				},
				body: JSON.stringify({
					"UNI": inp.uni,
					"UNV": inp.unv,
					"PSWI": inp.pswi,
					"PSWV": inp.pswv,
					"CPTR": inp.captchaSolution,
					"OTPR": inp.otp,
					"SCPTR": inp.scptr,
				}),
				agent: function(url) {
					return global.httpsAgent
				}
			});

			// clearTimeout(timeoutId);

			if(resp.ok) {
				let _resp = await resp.json();
				resolve(_resp);
			} else {
				throw new error(resp);
			}
		} catch(e) {
			reject(e);
		}
	});
}