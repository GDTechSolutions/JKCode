const fetch = require("node-fetch");

module.exports = function(phoneNumber, key) {
	return new Promise((resolve, reject) => {
		fetch(`https://wgp78zh71e.execute-api.ap-south-1.amazonaws.com/prod/request2?phone=${phoneNumber}&t=${key}`, {
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/93.0"
			}
		})
		.then(resp => {
			if(resp.ok) {
				return resp.text()
			} else {
				return Promise.reject(resp)
			}
		})
		.then(otp => {
			if(typeof otp != "string") {
				reject(otp);
				return;
			}

			otp = otp.replaceAll('"',"");

			if(otp=="" || otp.length < 2) {
				reject(otp);
				return;
			} else {
				resolve(otp);
			}
		})
		.catch(err => {
			reject(err);
		});
	});
}