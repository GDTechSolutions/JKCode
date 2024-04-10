const fetch = require("node-fetch");

const populate_grid_url = "https://onlinebooking.sand.telangana.gov.in/Order/NEWBOOKING.aspx/PopulateGrid";

module.exports = function(inp) {
	return new Promise(async (resolve, reject) => {
		try {
			resp = await fetch(populate_grid_url, {
				method: "POST",
				headers: {
					"Host": "onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Accept": "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					"Referer": "https://onlinebooking.sand.telangana.gov.in/",
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Connection": "keep-alive",
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": "Windows",
					"Sec-Fetch-Dest": "document",
					"Sec-Fetch-Mode": "navigate",
					"Sec-Fetch-Site": "same-origin",
					"Sec-Fetch-User": "?1",
					"Cookie": `${inp.cookie}`,
					"sTicket": inp.sTicket
				},
				body: JSON.stringify({
					"DID": "0"
				}),
				agent: function(url) {
					return global.httpsAgent
				}
			});

			if(!resp.ok) {
				return reject(resp);
			}

			let json = await resp.json();
			let data = JSON.parse(json.d);
			resolve(data);
			
		} catch(e) {
			reject(e);
		}
	});
}