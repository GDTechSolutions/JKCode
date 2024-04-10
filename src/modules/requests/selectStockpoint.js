const fetch = require("node-fetch");

const url = "https://onlinebooking.sand.telangana.gov.in/Order/NEWBOOKING.aspx/rdselstckpoint";

module.exports = function(inp) {
	return new Promise(async (resolve, reject) => {
		try {
			let resp = await fetch(url, {
				method: "POST",
				headers: {
					"Host": "onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"X-Requested-With": "XMLHttpRequest",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Connection": "keep-alive",
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": "Windows",
					"Sec-Fetch-Dest": "document",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",

					"Content-Type": "application/json",
					"Cookie": `${inp.cookie}`,
					"sTicket": inp.sTicket
				},
				body: JSON.stringify({
					"DID": inp.did,
					"SPID": inp.spid,
					"CDID":inp.cdid
				}),
				agent: function(url) {
					return global.httpsAgent
				}
			});

			if(! resp.ok) {
				return reject(resp);
			} else {
				let data = await resp.json();
				if(data.STATUS="T") {
					resolve(JSON.parse(data.d));
				} else {
					reject(JSON.parse(data.d));
				}
			}
		} catch(e) {
			reject(e);
		}
	});
}