const fetch = require("node-fetch");
const AbortController = require("abort-controller");

function getCaptcha(url, sessionID) {
	return new Promise(async (resolve, reject) => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 2000);
		try {
			let resp = await fetch(url, {
				headers: {
					'Accept': "image/avif,image/webp,*/*",
					// "Cookie": `ASP.NET_SessionId=${sessionID}`,
					"Host": "onlinebooking.sand.telangana.gov.in",
					"Accept-Encoding": "gzip, deflate, br",
					"Sec-Fetch-Dest": "image",
					"Sec-Fetch-Mode": "cors",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Connection": "keep-alive",
					"Accept-Language": "n-US,en;q=0.5"
				},
				signal: controller.signal
			});
			clearTimeout(timeoutId);
			if(resp.ok) {
				let buffer = await resp.buffer();
				let hex = buffer.toString('base64');
				if(hex.length == 0) {
					reject("Buffer is nil");
				} else {
					resolve(hex);
				}
			} else {
				reject(resp);
			}
		} catch(e) {
			reject(e);
		}
	})
}

module.exports = getCaptcha;