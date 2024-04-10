const fetch = require("node-fetch");

module.exports = function(imgData, key) {
	// console.log(imgData, key);
	// const controller = new AbortController();
	// const timeoutId = setTimeout(() => controller.abort(), 300);
	return new Promise(async (resolve, reject) => {
		let data = JSON.stringify({
			img: imgData,
			key
		});

		try {
			let resp = await fetch("https://dqpyt1moo9.execute-api.ap-south-1.amazonaws.com/prod/v1", {
				method: "POST",
				// signal: controller.signal,
				headers: {
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"Origin": "https://onlinebooking.sand.telangana.gov.in",
					"Host": "dqpyt1moo9.execute-api.ap-south-1.amazonaws.com",
					"Referer": "https://onlinebooking.sand.telangana.gov.in",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
					"Content-Length": `${data.length}`
				},
				body: data
			});
			// clearTimeout(timeoutId);
			if(!resp.ok) {
				reject(resp);
				return;
			}

			let x = await resp.json();
			console.log(x);

			if(x.response == "WRGKEY") {
				reject();
			} else if(typeof x.errorMessage != "undefined") {
				reject();
			} else if(x.response.trim() == "") {
				reject();
			} else {
				resolve(x.response);
			}
		} catch(e) {
			reject(e);
		}
	});
}