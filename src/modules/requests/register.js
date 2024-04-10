const fetch = require("node-fetch");

const url = "https://onlinebooking.sand.telangana.gov.in/Order/NEWBOOKING.aspx/CallSMS";

module.exports = function(inp) {
	return new Promise(async (resolve, reject) => {
		try {
			let resp = await fetch(url, {
				method: "POST",
				headers: {
					"sec-ch-ua-mobile": "?0",
					"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"content-type": "application/json; charset=UTF-8",
					"accept": "application/json, text/javascript, */*; q=0.01",
					"referer": "https://onlinebooking.sand.telangana.gov.in/",
					"x-requested-with": "XMLHttpRequest",
					"sec-ch-ua-platform": "Windows",
	
					"sticket": inp.sTicket,
					"cookie": `${inp.cookie}`
				},
				body: JSON.stringify({
					"CGSTIN": "",
					"SANDPURPOSE": "2",
					"AQ": inp.aq,
					"VEHICLENO": inp.vehicleNumber,
					"DELDISTRICT": "16",
					"DELMANDAL": "78",
					"DELVILLAGE": "166",
					"CECODE": inp.captcha,
					"EMAIL": inp.email,
					"LBLK": inp.lblk,
					"PG": "EN-HDFC",
					"TOTP": "Y"
				}),
				agent: function(url) {
					return global.httpsAgent
				}
			});
	
			if(resp.ok) {
				let data = await resp.json();
				let d = JSON.parse(data.d);
				resolve(d);
			} else {
				reject(resp);
			}
		} catch(e) {
			reject(e);
		}
	});
}